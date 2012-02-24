#!/usr/bin/env python
"""
Minify and concatenate all Javascript files referenced from ``layout/base.j2``
into ``content/media/js/minified.js``.

"""
import os.path, re, subprocess


BIN = os.path.dirname(__file__)
BASE = os.path.dirname(BIN)
MEDIA = os.path.join(BASE, "content", "media")
LAYOUT = os.path.join(BASE, "layout")


COMPILER_JAR = os.path.join(BIN, "compiler.jar")
JS_FILE_RE = re.compile(r'<script src="{{ media_url\(\'(.+)\'\) }}"></script>')



def main():
    """
    Minify all JS files referenced from base.j2 into minified.js.

    """
    minify(
        find_js_files(os.path.join(LAYOUT, "base.j2")),
        os.path.join(MEDIA, "js", "minified.js"),
        )



def find_js_files(template):
    """
    Return list of JS files referenced from given Jinja2 template.

    Given template file and returned paths are absolute filesystem paths.

    """
    ret = []
    with open(template) as tpl:
        for line in tpl.readlines():
            match = JS_FILE_RE.search(line)
            if match:
                js_file = os.path.join(MEDIA, match.group(1))
                if os.path.isfile(js_file):
                    ret.append(js_file)
    return ret



def minify(js_files, output_file):
    """
    Run given JS files through Closure Compiler and send output to ``output``.

    All paths should be absolute.

    """
    # if the target output file is listed in input files, remove it
    try:
        js_files.remove(output_file)
    except ValueError:
        pass

    args = ["java", "-jar", COMPILER_JAR, "--warning_level", "QUIET"]
    args.extend("--js={0}".format(fn) for fn in js_files)
    args.append("--js_output_file={0}".format(output_file))

    subprocess.check_call(args)





if __name__ == "__main__":
    main()
