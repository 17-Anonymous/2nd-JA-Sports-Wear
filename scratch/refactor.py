import re
import os

def refactor():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    style_pattern = re.compile(r'(\s*<style[^>]*>)(.*?)(</style>)', re.IGNORECASE | re.DOTALL)
    style_match = style_pattern.search(html)

    if style_match:
        css_content = style_match.group(2).strip()
        link_tag = '\n    <link rel="stylesheet" href="css/style.css">'
        html = html[:style_match.start()] + link_tag + html[style_match.end():]
    else:
        css_content = ""

    script_pattern = re.compile(r'(\s*<script(?![^>]*src=)[^>]*>)(.*?)(</script>)', re.IGNORECASE | re.DOTALL)
    script_match = script_pattern.search(html)

    if script_match:
        js_content = script_match.group(2).strip()
        script_tag = '\n    <script src="js/script.js" defer></script>'
        html = html[:script_match.start()] + script_tag + html[script_match.end():]
    else:
        js_content = ""

    os.makedirs('css', exist_ok=True)
    os.makedirs('js', exist_ok=True)

    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(css_content + '\n')

    with open('js/script.js', 'w', encoding='utf-8') as f:
        f.write(js_content + '\n')

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Refactoring complete.")

if __name__ == '__main__':
    refactor()
