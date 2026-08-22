#!/usr/bin/env python3
"""Generate a Markdown twin of every HTML page.

AI crawlers pay full HTML token cost to read a styled page. Serving a
Markdown version of the same content is the emerging convention and
Cloudflare measured up to 80% fewer tokens for it.

Run from the repo root:  python3 tools-build-markdown.py
"""
import re, html, glob, io, os

SKIP_BLOCK = re.compile(
    r'<(script|style|noscript|svg|form)\b.*?</\1>', re.S | re.I)
NAVFOOT = re.compile(
    r'<(nav|footer|header)\b[^>]*>.*?</\1>', re.S | re.I)
TOPBAR = re.compile(
    r'<div class="topbar".*?</div>\s*</div>', re.S | re.I)


def text_of(frag):
    t = re.sub(r'<(br|/?div|/?span|/?p|/?li|/?h[1-6])\b[^>]*>', ' ', frag)
    t = re.sub(r'<[^>]+>', '', t)
    t = html.unescape(t)
    return ' '.join(t.split())


def convert(path):
    s = io.open(path, encoding='utf8').read()

    title = ''
    m = re.search(r'<title>(.*?)</title>', s, re.S | re.I)
    if m:
        title = text_of(m.group(1))

    desc = ''
    m = re.search(r'<meta name="description" content="(.*?)"', s, re.S | re.I)
    if m:
        desc = html.unescape(m.group(1)).strip()

    body = re.search(r'<body[^>]*>(.*)</body>', s, re.S | re.I)
    b = body.group(1) if body else s
    for rx in (SKIP_BLOCK, NAVFOOT, TOPBAR):
        b = rx.sub(' ', b)

    out = []
    # walk the block-level elements in document order
    pat = re.compile(
        r'<(h1|h2|h3|p|li|blockquote|summary)\b[^>]*>(.*?)</\1>', re.S | re.I)
    seen = set()
    for m in pat.finditer(b):
        tag = m.group(1).lower()
        inner = m.group(2)
        if tag == 'blockquote':
            inner = re.sub(r'<div class="stars".*?</div>', '', inner, flags=re.S)
        t = text_of(inner)
        if not t or len(t) < 2:
            continue
        key = (tag, t)
        if key in seen:
            continue
        seen.add(key)
        if tag == 'h1':
            out.append('# ' + t)
        elif tag == 'h2':
            out.append('## ' + t)
        elif tag == 'h3':
            out.append('### ' + t)
        elif tag == 'summary':
            out.append('### ' + t)
        elif tag == 'li':
            out.append('- ' + t)
        elif tag == 'blockquote':
            out.append('> ' + t)
        else:
            out.append(t)

    md = []
    if title:
        md.append('<!-- Markdown version of https://alu-dewolf.be/%s -->' % path)
        md.append('')
    if desc:
        md.append('> %s' % desc)
        md.append('')
    # collapse consecutive list items into blocks
    prev_list = False
    for line in out:
        is_list = line.startswith('- ')
        if prev_list and is_list:
            md.append(line)
        else:
            if md and md[-1] != '':
                md.append('')
            md.append(line)
        prev_list = is_list
    md.append('')
    return '\n'.join(md)


def main():
    pages = sorted(
        f for f in glob.glob('*.html') + glob.glob('nl/*.html')
        + glob.glob('fr/*.html') + glob.glob('en/*.html')
        if not f.endswith('.bak') and '404' not in f
        and not re.search(r'google[0-9a-f]{16}\.html', f))
    n = 0
    for p in pages:
        md = convert(p)
        target = p[:-5] + '.md'
        io.open(target, 'w', encoding='utf8').write(md)
        n += 1
    print('wrote %d markdown twins' % n)


if __name__ == '__main__':
    main()
