# How to Add Your Own Logo

## Steps to Replace the Soccer Ball with Your Logo:

1. **Prepare your logo image:**
   - Make sure your logo is in PNG, JPG, or SVG format
   - Recommended size: 32x32 pixels or 64x64 pixels (square)
   - Name it: `logo.png` (or `logo.jpg` or `logo.svg`)

2. **Add your logo to the frontend folder:**
   - Copy your logo file to: `C:\Hassan_football\frontend\`
   - The file should be at: `C:\Hassan_football\frontend\logo.png`

3. **That's it!**
   - The website will automatically use your logo
   - If the logo file is not found, it will show the soccer ball emoji (⚽) as a fallback

## Example:
```
C:\Hassan_football\
├── frontend\
│   ├── logo.png          ← Put your logo here
│   ├── index.html
│   ├── article.html
│   └── ...
```

## Logo Specifications:
- **Format**: PNG (recommended), JPG, or SVG
- **Size**: 32x32px to 64x64px (square)
- **Background**: Transparent (for PNG) or white
- **File name**: Must be exactly `logo.png` (or .jpg/.svg)

## If you want to use a different filename:
Open each HTML file and change `logo.png` to your filename:
- `frontend/index.html`
- `frontend/article.html`
- `frontend/dashboard.html`
- `frontend/login.html`
- `frontend/register.html`

Look for this line and change `logo.png` to your filename:
```html
<img src="logo.png" alt="Football News Logo" class="w-8 h-8">
```

For example, if your logo is named `my-logo.svg`:
```html
<img src="my-logo.svg" alt="Football News Logo" class="w-8 h-8">
```
