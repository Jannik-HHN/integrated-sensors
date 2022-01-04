var timeouts = [];

var bit_template = {
    bit_sync: create_dictionary(1, 15, options_bit_sync),
    frame_sync: create_dictionary(16, 24, options_frame_sync),
    format_flag: create_dictionary(25, 25, options_format_flag),
    protocol_flag: create_dictionary(26, 26, options_protocol_type),
    country_code: create_dictionary(27, 36, options_country_code),
    protocol_code: create_dictionary(37, 40, options_protocol_code),
    type_approval: create_dictionary(41, 50, convert_bits),
    serial_number: create_dictionary(51, 64, convert_bits),
    latitude_data_1: create_dictionary(65, 74, calculate_position),
    longitude_data_1: create_dictionary(75, 85, calculate_position),
    fixed_bits: create_dictionary(107, 110, options_fixed_bits),
    source_of_position: create_dictionary(111, 111, options_source_of_position),
    auxiliary_radio_locating_device_code: create_dictionary(112, 112, options_auxiliary_radio_locating_device_code),
}

var assigned_bits = {
    bit_sync: {
        name: "Bit Synchronization",
        fromTo: "Bits 1 - 15",
        bits: "",
        option: "",
        flag: ""
    },
    frame_sync: {
        name: "Frame Synchronization",
        fromTo: "Bits 16 - 24",
        bits: "",
        option: "",
        flag: ""
    },
    format_flag: {
        name: "Format Flag",
        fromTo: "Bit 25",
        bits: "",
        option: "",
        flag: ""
    },
    protocol_flag: {
        name: "Protocol Flag",
        fromTo: "Bit 26",
        bits: "",
        option: "",
        flag: ""
    },
    country_code: {
        name: "Country",
        fromTo: "Bits 27 - 36",
        bits: "",
        option: "",
        flag: ""
    },
    protocol_code: {
        name: "Protocol Code",
        fromTo: "Bits 37 - 40",
        bits: "",
        option: "",
        flag: ""
    },
    type_approval: {
        name: "Type Approval Certificate Number",
        fromTo: "Bits 41 - 50",
        bits: "",
        option: "",
        flag: ""
    },
    serial_number: {
        name: "Serial Number",
        fromTo: "Bits 51 - 64",
        bits: "",
        option: "",
        flag: ""
    },
    latitude_data_1: {
        name: "Latitude Position",
        fromTo: "Bits 65 - 74",
        bits: "",
        option: "",
        flag: "",
        default_value: "0111111111",
        direction: "latitude"
    },
    longitude_data_1: {
        name: "Longitude Position",
        fromTo: "Bits 75 - 85",
        bits: "",
        option: "",
        flag: "",
        default_value: "01111111111",
        direction: "longitude"
    },
    fixed_bits: {
        name: "Fixed Bits",
        fromTo: "Bits 107 - 110",
        bits: "",
        option: "",
        flag: ""
    },
    source_of_position: {
        name: "Source of Position",
        fromTo: "Bit 111",
        bits: "",
        option: "",
        flag: ""
    },
    auxiliary_radio_locating_device_code: {
        name: "121.5 MHz Auxiliary Radio Locating Device",
        fromTo: "Bit 112",
        bits: "",
        option: "",
        flag: ""
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

    // Assign the Bit Patterns and display the info on screen
    var counter = 1;
    for(var key in bit_template) {
        assigned_bits[key]["flag"] = options_flags.valid
        assigned_bits[key]["bits"] = bitString.substring(bit_template[key].from - 1, bit_template[key].to)
        assigned_bits[key]["option"] = check_for_option(assigned_bits[key], bit_template[key]["options"])

        create_card(card_container, assigned_bits[key], key, counter*150)
        counter++;
    }
}

function create_card(element, section, key, timer) {

    var newDiv = document.createElement("div");
    newDiv.classList.add("bit-content-container", "card", "d-inline-block", "m-3", "h-100", "border-0")
    element.appendChild(newDiv)

    var timeout = setTimeout(() => {
        newDiv.innerHTML =
            '<div class="bit-content shadow position-relative row g-0 round" onclick="select_bits(' + (bit_template[key].from - 1) + ',' + bit_template[key].to + ')">' + 
                '<div class="col-3 d-flex justify-content-center shadow round-start">' + 
                    '<div class="align-self-center d-flex flex-column">' + 
                        '<i class="fas icon ' + section.flag.icon  + '"></i>' + 
                        '<span class="badge mt-3 ' + section.flag.badge  + '">' + section.flag.text  + '</span>' +
                    '</div>' + 
                '</div>' + 
            '<div class="col-9">' + 
                '<div class="card-header fw-bold round-top-right text-center ' + section.flag.badge  + '">' + section["name"] + '</div>' + 
                    '<div class="card-body">' + 
                        '<h5 class="card-title fw-light">' + (section['option'] ? section['option'] : section['flag'].text) + '</h5>' + 
                        '<p class="card-text"><small class="text-muted">' + section["fromTo"] + '</small></p>' + 
                    '</div>' + 
                    '<div class="card-footer text-muted round-bottom-right">Bit Pattern: ' + section["bits"] + '</div>' + 
                '</div>' + 
            '</div>'
    }, timer);
    timeouts.push(timeout);
}