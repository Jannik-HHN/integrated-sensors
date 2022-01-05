var timeouts = [];

var bit_sections = {
    bit_sync: {
        name: "Bit Synchronization",
        from: 1,
        to: 15,
        options: options_bit_sync
    },
    frame_sync: {
        name: "Frame Synchronization",
        from: 16,
        to: 24,
        options: options_frame_sync
    },
    format_flag: {
        name: "Format Flag",
        from: 25,
        to: 25,
        options: options_format_flag
    },
    protocol_flag: {
        name: "Protocol Flag",
        from: 26,
        to: 26,
        options: options_protocol_type
    },
    country_code: {
        name: "Country",
        from: 27,
        to: 36,
        options: options_country_code
    },
    protocol_code: {
        name: "Protocol Code",
        from: 37,
        to: 40,
        options: options_protocol_code
    },
    type_approval: {
        name: "Type Approval Certificate Number",
        from: 41,
        to: 50,
        options: convert_bits_to_number
    },
    serial_number: {
        name: "Serial Number",
        from: 51,
        to: 64,
        options: convert_bits_to_number
    },
    latitude_coarse: {
        name: "Coarse Latitude Position",
        from: 65,
        to: 74,
        options: calculate_position,
        accuracy: "coarse",
        orientation: "latitude"
    },
    longitude_coarse: {
        name: "Coarse Longitude Position",
        from: 75,
        to: 85,
        options: calculate_position,
        accuracy: "coarse",
        orientation: "longitude"
    },
    bch_1: {
        name: "BCH-1 Error Correcting Code",
        from: 86,
        to: 106,
        options: undefined
    },
    fixed_bits: {
        name: "Fixed Bits",
        from: 107,
        to: 110,
        options: options_fixed_bits
    },
    source_of_position: {
        name: "Source of Position",
        from: 111,
        to: 111,
        options: options_source_of_position
    },
    auxiliary_radio_locating_device_code: {
        name: "121.5 MHz Auxiliary Radio Locating Device",
        from: 112,
        to: 112,
        options: options_auxiliary_radio_locating_device_code
    },
    latitude_offset: {
        name: "Offset Latitude Position",
        from: 113,
        to: 122,
        options: calculate_position,
        accuracy: "offset",
        orientation: "latitude"
    },
    longitude_offset: {
        name: "Offset Longitude Position",
        from: 123,
        to: 132,
        options: calculate_position,
        accuracy: "offset",
        orientation: "longitude"
    },
    bch_2: {
        name: "BCH-2 Error Correcting Code",
        from: 133,
        to: 144,
        options: undefined
    },
}

function decode_bits() {
    // Clear all pending Timers that havent finished from Card Animation
    timeouts.forEach(timeout => clearTimeout(timeout))
    timeouts = []

    // Get the Container and Input, remove whitespace and replace the input
    var card_container = document.getElementById("info-content");
    var input = document.getElementById('bitstring')
    var bitString = input.value.replace(/\s+/g, '')
    input.value = bitString;

    // Display Error, if Bit String doesnt use correct Protocol
    if(!check_for_valid_bitstring(bitString)) {
        card_container.innerHTML =
            '<div class="hint text-center mx-5 bit-content position-relative text-danger">' + 
                '<h1 class="display-6"><span class="fw-bold">Uh oh...</span></h1>' + 
                '<h1 class="display-6 fs-2">It looks like this Protocol is <span class="fw-bold">not supported</span>. The ELT Decoder only supports Serial Standard Location Protocols.</h1>'
            '</div>'
        return;
    }

    // Extract Hex-ID
    var hexString = bitString.substring(25, 64) + "011111111101111111111"
    var hexDecoded = convert_bits_to_hex(hexString)

    // Display the Hex-ID on screen
    card_container.innerHTML =
        '<div class="bit-content d-flex flex-wrap justify-content-center position-relative w-100">' +
            '<div class="hint text-center mx-5 mb-3">' +
                '<h1 class="display-6 fs-2 fw-bold">Beacon Identification</h1>' +
                '<h1 class="display-6 fs-3">' + hexDecoded + '</h1>' +
            '</div>' +
        '</div>'

    // Assign the Information and display the info on screen
    var counter = 1;
    for(var key in bit_sections) {
        bit_sections[key]["flag"] = options_flags.valid
        bit_sections[key]["bits"] = bitString.substring(bit_sections[key].from - 1, bit_sections[key].to)
        bit_sections[key]["fromTo"] = create_from_to_string(bit_sections[key].from, bit_sections[key].to)
        bit_sections[key]["value"] = check_for_option(bit_sections[key], bit_sections[key]["options"])

        create_card(card_container, bit_sections[key], key, counter*150)
        counter++;
    }
}

function create_card(element, section, key, timer) {

    var newDiv = document.createElement("div");
    newDiv.classList.add("bit-content-container", "card", "d-inline-block", "m-3", "h-100", "border-0")
    element.appendChild(newDiv)

    var timeout = setTimeout(() => {
        newDiv.innerHTML =
            '<div class="bit-content shadow position-relative row g-0 round" onclick="select_bits(' + (bit_sections[key].from - 1) + ',' + bit_sections[key].to + ')">' + 
                '<div class="col-3 d-flex justify-content-center shadow round-start">' + 
                    '<div class="align-self-center d-flex flex-column">' + 
                        '<i class="fas icon ' + section.flag.icon  + '"></i>' + 
                        '<span class="badge mt-3 ' + section.flag.badge  + '">' + section.flag.text  + '</span>' +
                    '</div>' + 
                '</div>' + 
            '<div class="col-9">' + 
                '<div class="card-header fw-bold round-top-right text-center ' + section.flag.badge  + '">' + section["name"] + '</div>' + 
                    '<div class="card-body">' + 
                        '<h5 class="card-title fw-light">' + (section['value'] ? section['value'] : section['flag'].text) + '</h5>' + 
                        '<p class="card-text"><small class="text-muted">' + section["fromTo"] + '</small></p>' + 
                    '</div>' + 
                    '<div class="card-footer text-muted round-bottom-right">Bit Pattern: ' + section["bits"] + '</div>' + 
                '</div>' + 
            '</div>'
    }, timer);
    timeouts.push(timeout);
}