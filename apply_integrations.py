import glob
import os

head_inject = '''
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <link rel="manifest" href="manifest.json">
</head>'''

body_inject = '''
    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error', err));
        });
      }
    </script>
</body>'''

files = glob.glob("*.html")
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "manifest.json" not in content:
        content = content.replace('</head>', head_inject)
        content = content.replace('</body>', body_inject)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    else:
        print(f"Skipped {file} (already updated)")
