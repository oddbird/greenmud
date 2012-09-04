#!/usr/bin/env python
"""
Unpacks single-file Markdown novel in greenmud.md into HTML files in nested
subdirectories of content/.

"""
import argparse
import codecs
import os
import re
import shutil
import sys
import unicodedata
import yaml


TEMPLATE = u"""
---
{yaml}
---

{{% filter markdown %}}

{markdown}

{{% endfilter %}}
"""


PAGE_BREAK = "------"


BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))



def main():
    """Command-line entrypoint."""

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        metavar="FILEPATH",
        default=os.path.join(BASE, "greenmud.md"),
        type=str,
        help="path to greenmud.md",
        )
    parser.add_argument(
        "--output",
        metavar="DIRPATH",
        default=os.path.join(BASE, "content"),
        type=str,
        help="path to output directory",
        )
    parser.add_argument(
        "--skeleton",
        metavar="DIRPATH",
        default=os.path.join(BASE, "skeleton"),
        type=str,
        help="path to initial-skeleton directory",
        )

    args = parser.parse_args()

    if os.path.exists(args.output):
        print "Output directory {0} exists; remove it first.".format(
            args.output)
        sys.exit(1)

    unpack(args.source, args.output, args.skeleton)


def unpack(source, output_dir, skeleton_dir):
    """Unpack novel Markdown from given file into output directory."""
    parser = NovelParser(output_dir, skeleton_dir)

    parser.unpack(source)


class NovelParser(object):
    """
    Encapsulates parsing state.

    Unpack method is not thread-safe.

    """
    def __init__(self, output_dir, skeleton_dir):
        self.output_dir = output_dir
        self.skeleton_dir = skeleton_dir
        # tracks the current nested-directories path segments
        self.path_segments = []


    def unpack(self, source_file):
        self._ensure_output_dir()
        with codecs.open(source_file, encoding="UTF-8") as f:
            slugs_in_chapter = set()
            last_page = None
            for page in Page.pages(f.xreadlines()):
                if page.is_title:
                    slugs_in_chapter = set()
                if page.is_book_title:
                    self.path_segments = [page.book_slug]
                elif page.is_chapter_title:
                    self.path_segments[1:] = [page.chapter_slug]
                if page.meta["slug"] in slugs_in_chapter:
                    page.meta["slug"] = "{0}-2".format(page.meta["slug"])
                    page.meta["url"] = "{0}.html".format(page.meta["slug"])
                slugs_in_chapter.add(page.meta["slug"])
                page.path_segments = self.path_segments[:]
                if last_page is not None:
                    last_page.next = page
                    page.prev = last_page
                    last_page.write(self.output_dir)
                last_page = page
            last_page.write(self.output_dir)


    def _ensure_output_dir(self):
        """Create the output directory if it doesn't exist and copy skel."""
        shutil.copytree(self.skeleton_dir, self.output_dir, symlinks=True)


class Page(object):
    """Represents a page."""
    def __init__(self, markdown, meta, next_page=None, prev_page=None,
                 book_meta=None, chapter_meta=None, path_segments=None):
        self.markdown = markdown
        self.meta = meta or {}
        self.next = next_page
        self.prev = prev_page
        self.book_meta = book_meta or {}
        self.chapter_meta = chapter_meta or {}
        self.path_segments = path_segments or []

        self.meta.setdefault("body_class", "demo")

        if self.is_title:
            self.meta.setdefault("slug", "titlepage")
            self.meta.setdefault("url", "index.html")
        else:
            tags_stripped = re.sub('<.*?>', '', self.markdown)
            self.meta.setdefault(
                "slug",
                slugify("-".join(tags_stripped.split()[:5])).lstrip("-"),
                )
            self.meta.setdefault("url", u"{0}.html".format(self.meta["slug"]))


    @property
    def is_chapter_title(self):
        return "chapter" in self.chapter_meta


    @property
    def chapter_slug(self):
        if self.is_chapter_title:
            return self.chapter_meta.get(
                "chapter_slug", slugify(self.chapter_meta["chapter"]))
        elif self.is_book_title:
            return self.book_meta.get("chapter_slug", "frontmatter")
        try:
            return self.path_segments[1]
        except IndexError:
            return None


    @property
    def is_book_title(self):
        return "book" in self.book_meta


    @property
    def book_slug(self):
        if self.is_book_title:
            return self.book_meta.get(
                "book_slug", slugify(self.book_meta["book"]))
        try:
            return self.path_segments[0]
        except IndexError:
            return None


    @property
    def is_title(self):
        return self.is_book_title or self.is_chapter_title


    @property
    def title_slug(self):
        if self.is_book_title:
            return self.book_slug
        elif self.is_chapter_title:
            return self.chapter_slug
        return None


    @property
    def title_meta(self):
        if self.is_book_title:
            return self.book_meta
        elif self.is_chapter_title:
            return self.chapter_meta
        return None


    @property
    def extra_styles(self):
        if self.is_title:
            return "{0}/{1}.css".format(self.book_slug, self.chapter_slug)
        return None


    @classmethod
    def parse(cls, lines):
        """Parse a page from the given raw source lines."""
        content_lines = []
        meta_lines = []
        book_meta_lines = []
        chapter_meta_lines = []

        in_meta = None

        for line in lines:
            stripped = line.strip()
            if in_meta is not None:
                if stripped == "-->":
                    in_meta = None
                else:
                    in_meta.append(line)
            else:
                if stripped == u"<!-- meta":
                    in_meta = meta_lines
                elif stripped == u"<!-- book":
                    in_meta = book_meta_lines
                elif stripped == u"<!-- chapter":
                    in_meta = chapter_meta_lines
                else:
                    content_lines.append(line)

        return cls(
            markdown=u"\n".join(content_lines),
            meta=yaml.load(u"\n".join(meta_lines)),
            book_meta=yaml.load(u"\n".join(book_meta_lines)),
            chapter_meta=yaml.load(u"\n".join(chapter_meta_lines)),
            )


    @classmethod
    def pages(cls, lines):
        """Given iterable of lines, generate pages."""
        current_page_lines = []

        for line in lines:
            line = line.rstrip().decode("UTF-8")
            if line == PAGE_BREAK:
                yield cls.parse(current_page_lines)
                current_page_lines = []
            else:
                current_page_lines.append(line)

        yield cls.parse(current_page_lines)


    def ensure_meta_defaults(self):
        if self.next is not None:
            n = self.meta.setdefault("next", {})
            n.setdefault("slug", self.next.meta["slug"])
            if self.next.is_title:
                self.meta.setdefault("chapter_break", "after")
                n.setdefault("url", "{0}/".format(self.next.title_slug))
                if len(self.path_segments) == 2:
                    n["url"] = "../{0}".format(n["url"])
                    if self.next.is_book_title:
                        n["url"] = "../{0}".format(n["url"])
            else:
                n.setdefault("url", self.next.meta["url"])
        else:
            # final page gets chapter_break: after
            self.meta.setdefault("chapter_break", "after")
        if self.prev is not None:
            p = self.meta.setdefault("prev", {})
            p.setdefault("slug", self.prev.meta["slug"])
            p.setdefault("url", self.prev.meta["url"])
            if self.is_title:
                if self.is_book_title and self.prev.path_segments:
                    p["url"] = "../{0}/{1}".format(
                        "/".join(self.prev.path_segments), p["url"])
                elif len(self.prev.path_segments) == len(self.path_segments):
                    p["url"] = "../{0}/{1}".format(
                        self.prev.path_segments[-1], p["url"])
                else:
                    p["url"] = "../{0}".format(p["url"])

        if self.is_chapter_title:
            self.chapter_meta.setdefault("chapter_slug", self.chapter_slug)
            self.chapter_meta.setdefault("extra_styles", self.extra_styles)
            self.meta.setdefault("chapter_break", "before")

        if self.is_book_title:
            self.book_meta.setdefault("book_slug", self.book_slug)
            self.book_meta.setdefault("chapter_slug", u"frontmatter")
            self.book_meta.setdefault("extra_styles", self.extra_styles)
            self.meta.setdefault("chapter_break", "before")


    def write(self, output_dir):
        """Write data given in arguments out as HTML file."""
        # @@@ output meta.yaml and index.html instead for book/chapter titles
        self.ensure_meta_defaults()

        dest_dir = os.path.join(output_dir, *self.path_segments)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        dest_path = os.path.join(dest_dir, self.meta["url"])

        yaml_dump_opts = dict(
            indent=4,
            default_flow_style=False,
            encoding=None,
            Dumper=yaml.SafeDumper,
            )

        output = TEMPLATE.format(
            markdown=self.markdown,
            yaml=yaml.dump(self.meta, **yaml_dump_opts),
            )

        with codecs.open(dest_path, "w", encoding="UTF-8") as f:
            f.write(output)

        if self.is_title:
            meta_yaml_path = os.path.join(dest_dir, "meta.yaml")
            with codecs.open(meta_yaml_path, "w", encoding="UTF-8") as f:
                f.write(yaml.dump(self.title_meta, **yaml_dump_opts))


def slugify(value):
    """
    Normalizes string, converts to lowercase, removes non-alpha characters,
    and converts spaces to hyphens.
    """
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore')
    value = unicode(re.sub('[^\w\s-]', '', value).strip().lower())
    return re.sub('[-\s]+', '-', value)


# http://stackoverflow.com/questions/2890146/how-to-force-pyyaml-to-load-strings-as-unicode-objects
def construct_yaml_str(self, node):
    # Override the default string handling function
    # to always return unicode objects
    return self.construct_scalar(node)
yaml.Loader.add_constructor(u'tag:yaml.org,2002:str', construct_yaml_str)
yaml.SafeLoader.add_constructor(u'tag:yaml.org,2002:str', construct_yaml_str)



if __name__ == "__main__":
    main()
