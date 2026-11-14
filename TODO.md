# TODO: Update Color Palette to Trending Colors with Curved Button Edges

## Steps to Complete

1. **Update ThemeContext.tsx**
   - Add `buttonBorderRadius: number` to the Theme interface.
   - Update lightTheme with trending colors and buttonBorderRadius: 20.
   - Update darkTheme with trending colors and buttonBorderRadius: 20.

2. **Update Button Styles in Screens**
   - Update HomeScreen.tsx: Change all TouchableOpacity borderRadius to use theme.buttonBorderRadius.
   - Update CustomAlert.tsx: Change button borderRadius to use theme.buttonBorderRadius.
   - Update LoginScreen.tsx: Change button borderRadius to use theme.buttonBorderRadius.
   - Update SignupScreen.tsx: Change button borderRadius to use theme.buttonBorderRadius.
   - Update ProfileScreen.tsx: Change button borderRadius to use theme.buttonBorderRadius.
   - Update AddItemScreen.tsx: Change button borderRadius to use theme.buttonBorderRadius.
   - Update ReportsScreen.tsx: Change button borderRadius to use theme.buttonBorderRadius.
   - Update SplashScreen.tsx: Change button borderRadius to use theme.buttonBorderRadius.

3. **Verify Changes**
   - Test the app to ensure colors and curved edges are applied correctly.
   - Check both light and dark modes.

## Progress Tracking
- [x] Step 1: Update ThemeContext.tsx
- [x] Step 2a: Update HomeScreen.tsx
- [x] Step 2b: Update CustomAlert.tsx
- [x] Step 2c: Update LoginScreen.tsx
- [x] Step 2d: Update SignupScreen.tsx
- [x] Step 2e: Update ProfileScreen.tsx
- [x] Step 2f: Update AddItemScreen.tsx
- [x] Step 2g: Update ReportsScreen.tsx
- [x] Step 2h: Update SplashScreen.tsx
- [x] Step 3: Verify Changes
