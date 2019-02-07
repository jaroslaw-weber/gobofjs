const pickr = new Pickr({

    // Selector or element which will be replaced with the actual color-picker.
    // Can be a HTMLElement.
    el: '.color-picker',

    // Using the 'el' Element as button, won't replace it with the pickr-button.
    // If true, appendToBody will also be automatically true.
    useAsButton: false,

    // Start state. If true 'disabled' will be added to the button's classlist.
    disabled: false,

    // If set to false it would directly apply the selected color on the button and preview.
    comparison: true,

    // Default color
    default: '#83B994',

    // Default color representation.
    // Valid options are `HEX`, `RGBA`, `HSVA`, `HSLA` and `CMYK`.
    defaultRepresentation: 'HSVA',

    // Option to keep the color picker always visible. You can still hide / show it via
    // 'pickr.hide()' and 'pickr.show()'. The save button keeps his functionality, so if
    // you click it, it will fire the onSave event.
    showAlways: false,

    // If the color picker should have the body element as it's parent.
    appendToBody: false,

    // Close pickr with this specific key.
    // Default is 'Escape'. Can be the event key or code.
    closeWithKey: 'Escape',

    // Defines the position of the color-picker. Available options are
    // top, left and middle relativ to the picker button.
    // If clipping occurs, the color picker will automatically choose his position.
    position: 'middle',

    // Enables the ability to change numbers in an input field with the scroll-wheel.
    // To use it set the cursor on a position where a number is and scroll, use ctrl to make steps of five
    adjustableNumbers: true,

    // Show or hide specific components.
    // By default only the palette (and the save button) is visible.
    components: {

        preview: true, // Left side color comparison
        opacity: true, // Opacity slider
        hue: true,     // Hue slider

        // Bottom interaction bar, theoretically you could use 'true' as propery.
        // But this would also hide the save-button.
        interaction: {
            hex: true,  // hex option  (hexadecimal representation of the rgba value)
            rgba: true, // rgba option (red green blue and alpha)
            hsla: true, // hsla option (hue saturation lightness and alpha)
            hsva: true, // hsva option (hue saturation value and alpha)
            cmyk: true, // cmyk option (cyan mangenta yellow key )

            input: true, // input / output element
            clear: true, // Button which provides the ability to select no color,
            save: true   // Save button
        },
    },

    // Button strings, brings the possibility to use a language other than English.
    strings: {
       save: 'Save',  // Default for save button
       clear: 'Clear' // Default for clear button
    },

    // User has changed the color
    onChange(hsva, instance) {
        hsva;     // HSVa color object, if cleared null
        instance; // Current Pickr instance
    },

    // User has clicked the save button
    onSave(hsva, instance) {
        // same as onChange
    }
});