# Event Gallery Images

This directory contains images for the Past Events Gallery displayed on the Activities page.

## Adding Images

1. **Place your event photos here** with the following naming convention:
   - `event-1.jpg`
   - `event-2.jpg`
   - `event-3.jpg`
   - etc.

2. **Recommended specifications:**
   - **Aspect ratio:** 4:3 (e.g., 1200x900px or 1600x1200px)
   - **Format:** JPG or PNG
   - **File size:** Keep under 500KB for optimal loading performance
   - **Resolution:** 1200-2000px width is ideal for retina displays

3. **Update the gallery:**
   - The gallery is defined in `app/[locale]/activities/page.tsx`
   - Currently displays 6 images in a 3-column grid (desktop)
   - To add more images, update the `galleryImages` array in the component

## Current Images

The page currently expects these files:
- event-1.jpg
- event-2.jpg
- event-3.jpg
- event-4.jpg
- event-5.jpg
- event-6.jpg

Replace these placeholder filenames with your actual event photos!

## Tips

- Choose photos that show community engagement, active discussions, or group activities
- Mix wide shots (showing the venue/group) with closer shots (showing interactions)
- Ensure good lighting and composition for a professional appearance
- Consider including diverse moments: presentations, social time, collaborative work
