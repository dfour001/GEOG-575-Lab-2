function set_class_buttons(csvData) {
    // Class color palette
    let colors = {
        'BA': '#fec424',
        'BC': '#817b00',
        'BP': '#fe0000',
        'BS': '#00859c',
        'S': '#d2be57',
        'default': '#989898'
    };
    
    // Class dictionary
    let classDict = {
        'BA': 'BodyAttack',
        'BC': 'BodyCombat',
        'BP': 'BodyPump',
        'BS': 'BodyStep',
        'S': 'Sprint'
    }

    // Animate button when clicked and change attribute
    $('.button').on('click', function () {
        // Return all buttons to non-active state
        $('.button').removeClass('active');
        $('.button, .button-container').css('color', colors['default']);


        // Set selected button to active state
        $(this).addClass('active');

        // Set text color
        $(this).parent().css('color', 'white');
        $(this).css('color', colors[$(this).attr('data-class')]);

        // Change selected attribute
        let attribute = classDict[$(this).attr('data-class')];
        changeAttribute(attribute, csvData);
    })
}
