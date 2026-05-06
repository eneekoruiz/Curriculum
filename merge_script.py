import os

html_path = r'c:\Users\User\Desktop\PROYECTOS\curriculum\Curriculum\index.html'
js_path = r'c:\Users\User\Desktop\PROYECTOS\curriculum\Curriculum\engine_clean.js'

if not os.path.exists(js_path):
    print("JS path not found")
    exit(1)

with open(js_path, 'r', encoding='utf-8') as f:
    clean_js = f.read()

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '<script src="translations.js"></script>'
end_marker = '</script>'

start_idx = content.find(start_marker)
end_idx = content.rfind(end_marker)

if start_idx != -1 and end_idx != -1:
    end_idx += 9
    new_script_block = f'<script src="translations.js"></script>\n<script>\n{clean_js}\n</script>'
    new_content = content[:start_idx] + new_script_block + content[end_idx:]
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: Unified script block integrated.")
else:
    print(f"Markers not found. Start: {start_idx}, End: {end_idx}")
