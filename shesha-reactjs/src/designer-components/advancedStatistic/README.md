# Advanced Statistic Component

A highly flexible and configurable statistic component for displaying numeric values with rich customization options.

## Features

### Layout & Structure
- **Side Icons**: Add decorative icons to the left and/or right side of the statistic box
- **Dual Titles**: Support for both top and bottom titles with independent styling and alignment
- **Value-Centric Design**: The numeric value is the primary focus, positioned prominently in the center

### Prefix & Suffix
- Add text and/or icons before (prefix) and after (suffix) the value
- Independent color and size configuration for prefix/suffix elements
- Custom styling support

### Styling Options
The component supports comprehensive styling for all elements:
- **Value**: Font family, size, weight, color, and custom CSS
- **Top Title**: Font styling, alignment (left/center/right), and custom CSS
- **Bottom Title**: Font styling, alignment (left/center/right), and custom CSS
- **Prefix/Suffix**: Color, icon size, and custom CSS
- **Side Icons**: Size, color, and custom CSS
- **Container**: Dimensions, border, background, shadow, margin/padding

### Responsive Design
Full support for responsive styling across desktop, tablet, and mobile devices using the property router system.

## Configuration Properties

### Common Tab

#### Value Configuration
- `value`: The numeric value to display (can be bound to form data)
- `precision`: Number of decimal places to display
- `propertyName`: Bind the component to a form property

#### Top Title
- `text`: Title text to display above the value
- `align`: Text alignment (left, center, right)
- `font`: Font configuration (family, size, weight, color)

#### Bottom Title
- `text`: Title text to display below the value
- `align`: Text alignment (left, center, right)
- `font`: Font configuration (family, size, weight, color)

#### Prefix
- `text`: Text to display before the value
- `icon`: Icon to display with the prefix
- `color`: Color for the prefix text/icon
- `iconSize`: Size of the prefix icon

#### Suffix
- `text`: Text to display after the value
- `icon`: Icon to display with the suffix
- `color`: Color for the suffix text/icon
- `iconSize`: Size of the suffix icon

#### Left Side Icon
- `icon`: Icon to display on the left side of the box
- `color`: Icon color
- `size`: Icon size (16-128px)

#### Right Side Icon
- `icon`: Icon to display on the right side of the box
- `color`: Icon color
- `size`: Icon size (16-128px)

### Appearance Tab

The Appearance tab provides responsive styling options:
- **Top Title Font**: Font styling for the top title
- **Bottom Title Font**: Font styling for the bottom title
- **Value Font**: Font styling for the value
- **Prefix Styles**: Custom CSS for prefix elements
- **Suffix Styles**: Custom CSS for suffix elements
- **Left Icon Styles**: Custom CSS for left side icon
- **Right Icon Styles**: Custom CSS for right side icon
- **Dimensions**: Width, height, and their min/max values
- **Border**: Border width, color, style, and corner radius
- **Background**: Color, gradient, image, or URL background
- **Shadow**: Box shadow configuration
- **Margin & Padding**: Spacing configuration
- **Container Custom Styles**: Additional custom CSS

### Events Tab
- `onClick`: Custom event handler for click events

### Security Tab
- Permissions configuration

## Usage Examples

### Basic Statistic
```json
{
  "type": "advancedStatistic",
  "propertyName": "revenue",
  "value": 12000,
  "topTitle": {
    "text": "Total Revenue",
    "align": "center"
  },
  "prefix": {
    "text": "R"
  }
}
```

### Statistic with Side Icons
```json
{
  "type": "advancedStatistic",
  "propertyName": "userCount",
  "value": 1250,
  "leftIcon": {
    "icon": "UserOutlined",
    "color": "#1890ff",
    "size": 48
  },
  "topTitle": {
    "text": "Active Users",
    "align": "center"
  },
  "bottomTitle": {
    "text": "+10.65% from last month",
    "align": "center"
  }
}
```

### Statistic with Increase Indicator
```json
{
  "type": "advancedStatistic",
  "propertyName": "growth",
  "value": 10.65,
  "precision": 2,
  "topTitle": {
    "text": "Growth Rate"
  },
  "suffix": {
    "text": "%",
    "icon": "ArrowUpOutlined",
    "color": "#52c41a"
  }
}
```

## Visual Layout

Based on your mockup sketch, the component supports flexible layouts:

```
┌────────────────────────────────────────────┐
│ [1]        Title (optional)           [6]  │
│ [1]  [2][3] VALUE [4][5]              [6]  │
│ [1]        Title (optional)           [6]  │
└────────────────────────────────────────────┘

Legend:
1. Left Icon (side icon)
2. Prefix Icon
3. Prefix Text
4. Suffix Text
5. Suffix Icon
6. Right Icon (side icon)
```

**Two main configurations:**

**Configuration 1 - Title on Top:**
- Top Title
- Value with Prefix/Suffix
- (no bottom title)

**Configuration 2 - Title on Bottom:**
- Value with Prefix/Suffix
- Bottom Title
- (no top title)

**Configuration 3 - Both Titles:**
- Top Title
- Value with Prefix/Suffix
- Bottom Title

## Migration

The component includes migration support with versioning:
- **Version 1**: Basic migration from form API
- **Version 2**: Default styles initialization
- **Version 3**: Style migration from previous versions

## Component Type

`advancedStatistic`

## Display Category

Data Display

## Icon

BarChartOutlined
