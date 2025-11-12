# DocAI Frontend Color Customization Guide

## Overview

This guide explains how to customize colors and themes throughout the DocAI frontend application. The application uses a combination of CSS custom properties, Tailwind CSS classes, and component-specific styling.

## Global Color Variables (CSS Custom Properties)

The application uses CSS custom properties for consistent theming. To change colors globally, modify these variables in your CSS:

### Primary Color Scheme

```css
:root {
  --primary: 250 70% 65%; /* Main purple - change this for primary color */
  --primary-foreground: 0 0% 100%; /* Text on primary */

  --accent: 270 80% 70%; /* Accent magenta */
  --accent-foreground: 0 0% 100%;

  --destructive: 0 84% 60%; /* Error red */
  --destructive-foreground: 0 0% 100%;
}
```

### Dark Mode Colors

```css
.dark {
  --background: 222 84% 4.9%; /* Dark background */
  --foreground: 210 40% 98%; /* Light text */

  --muted: 217 32% 17%; /* Muted backgrounds */
  --muted-foreground: 215 20% 65%; /* Muted text */

  --card: 222 84% 4.9%; /* Card backgrounds */
  --card-foreground: 210 40% 98%;
}
```

### Light Mode Colors

```css
:root {
  --background: 0 0% 100%; /* White background */
  --foreground: 222 84% 4.9%; /* Dark text */

  --muted: 210 40% 96%; /* Light gray backgrounds */
  --muted-foreground: 215 25% 27%; /* Medium gray text */

  --card: 0 0% 100%; /* White cards */
  --card-foreground: 222 84% 4.9%;
}
```

## Component-Specific Color Changes

### PlexusBackground Colors

To change the animated background colors, edit `components/ui/PlexusBackground.jsx`:

```javascript
// Change these color values:
const nodeColor = isDark
  ? "rgba(151, 135, 243, 0.6)"
  : "rgba(124, 110, 224, 0.4)";
const lineColor = isDark
  ? "rgba(151, 135, 243, 0.3)"
  : "rgba(124, 110, 224, 0.2)";
```

### GridBackground Colors

For the grid background, modify `components/ui/GridBackground.jsx`:

```javascript
// Change the HSL values in the background styles:
background: "radial-gradient(ellipse at center, hsl(270 80% 70% / 0.4) 0%, transparent 70%)";
```

### Navigation Colors

Update navigation styling in `components/shared/navigation.jsx`:

```javascript
// Change logo background color:
bg-purple-600 hover:bg-purple-700

// Change active route indicator:
bg-purple-600
```

### Chat Interface Colors

Modify chat components in `components/chat/`:

```javascript
// User messages:
bg-purple-600 dark:bg-purple-500

// Bot messages:
bg-gray-100 dark:bg-gray-700

// Confidence badges:
text-green-600, text-orange-600, text-red-600
```

## Theme Customization Steps

1. **Global Theme Changes**:

   - Edit CSS custom properties in `globals.css` or your main stylesheet
   - Update the HSL values for `--primary`, `--accent`, etc.

2. **Component-Specific Changes**:

   - Locate the component file you want to modify
   - Find Tailwind classes or inline styles
   - Replace color classes (e.g., `bg-purple-600` → `bg-blue-600`)

3. **Background Animation Changes**:

   - For PlexusBackground: Modify RGBA color values in the component
   - For GridBackground: Update HSL values in CSS background properties

4. **Dark Mode Adjustments**:
   - Ensure both light and dark mode variants are updated
   - Test contrast ratios for accessibility

## Color Utility Classes Used

The application uses these Tailwind color patterns:

- `lavender-*`: Custom purple shades (primary)
- `purple-*`: Standard purple
- `gray-*`: Neutral grays
- `slate-*`: Alternative neutrals

## Testing Color Changes

After making changes:

1. Check both light and dark modes
2. Verify contrast ratios meet WCAG standards
3. Test on different screen sizes
4. Ensure animations still perform well

## Common Color Change Examples

### Change Primary Color to Blue

```css
:root {
  --primary: 220 90% 50%; /* Blue instead of purple */
}
```

### Change Background Colors

```css
:root {
  --background: 210 100% 98%; /* Very light blue background */
}

.dark {
  --background: 220 90% 8%; /* Dark blue background */
}
```

### Update PlexusBackground to Green Theme

```javascript
const nodeColor = isDark ? "rgba(34, 197, 94, 0.6)" : "rgba(34, 197, 94, 0.4)";
const lineColor = isDark ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.2)";
```

## File Locations for Color Changes

- **Global CSS**: `globals.css` or main stylesheet
- **PlexusBackground**: `components/ui/PlexusBackground.jsx`
- **GridBackground**: `components/ui/GridBackground.jsx`
- **Navigation**: `components/shared/navigation.jsx`
- **Chat Components**: `components/chat/*.jsx`
- **About Page**: `components/about/*.jsx`
