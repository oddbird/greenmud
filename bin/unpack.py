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
            for page in Page.pages(f.xreadlines()):
                # @@@ handle next/prev correctly
                # @@@ this sets extra_styles too seen; needs path_segments
                page.ensure_meta_defaults()
                if page.is_book_title:
                    self.path_segments = [page.book_meta["book_slug"]]
                elif page.is_chapter_title:
                    self.path_segments[1:] = [
                        page.chapter_meta["chapter_slug"]]
                page.path_segments = self.path_segments[:]
                page.write(self.output_dir)


    def _ensure_output_dir(self):
        """Create the output directory if it doesn't exist and copy skel."""
        shutil.copytree(self.skeleton_dir, self.output_dir)


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


    @property
    def is_chapter_title(self):
        return "chapter" in self.chapter_meta


    @property
    def is_book_title(self):
        return "book" in self.book_meta


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


    def ensure_meta_defaults(self):
        self.meta.setdefault("body_class", "demo")
        self.meta.setdefault(
            "slug", slugify("-".join(self.markdown.split()[:5])).lstrip("-"))
        self.meta.setdefault("url", u"{0}.html".format(self.meta["slug"]))
        if self.next is not None:
            self.meta["next"] = {"slug": self.next.slug, "url": self.next.url}
        if self.prev is not None:
            self.meta["prev"] = {"slug": self.prev.slug, "url": self.prev.url}

        if self.is_chapter_title:
            self.chapter_meta.setdefault(
                "chapter_slug", slugify(self.chapter_meta["chapter"]))
            self.chapter_meta.setdefault(
                "extra_styles",
                "/".join(
                    self.path_segments +
                    ["{0}.css".format(self.chapter_meta["chapter_slug"])]
                    )
                )

        if self.is_book_title:
            self.book_meta.setdefault(
                "book_slug", slugify(self.book_meta["book"]))
            self.book_meta.setdefault("chapter_slug", u"frontmatter")
            self.book_meta.setdefault(
                "extra_styles",
                "/".join(
                    self.path_segments +
                    [u"{0}.css".format(self.book_meta["chapter_slug"])]
                    )
                )


    def write(self, output_dir):
        """Write data given in arguments out as HTML file."""
        # @@@ output meta.yaml and index.html instead for book/chapter titles
        self.ensure_meta_defaults()

        dest_dir = os.path.join(output_dir, *self.path_segments)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        dest_path = os.path.join(dest_dir, self.meta["url"])

        output = TEMPLATE.format(
            markdown=self.markdown,
            yaml=yaml.dump(
                self.meta,
                indent=4,
                default_flow_style=False,
                encoding=None,
                Dumper=yaml.SafeDumper,
                ),
            )

        with codecs.open(dest_path, "w", encoding="UTF-8") as f:
            f.write(output)


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
