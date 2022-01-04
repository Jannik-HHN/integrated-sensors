var timeouts = [];

var bit_template = {
    bit_sync: {
        from: 1,
        to: 15,
        options: options_bit_sync
    },
    frame_sync: {
        from: 16,
        to: 24,
        options: options_frame_sync
    },
    format_flag: {
        from: 25,
        to: 25,
        options: options_format_flag
    },
    protocol_flag: {
        from: 26,
        to: 26,
        options: options_protocol_type
    },
    country_code: {
        from: 27,
        to: 36,
        options: options_country_code
    },
    protocol_code: {
        from: 37,
        to: 40,
        options: options_protocol_code
    },
    type_approval: {
        from: 41,
        to: 50,
        transform: convert_bits
    },
    serial_number: {
        from: 51,
        to: 64,
        transform: convert_bits
    },
    latitude_data_1: {
        from: 65,
        to: 74,
        transform: calculate_position
    },
    longitude_data_1: {
        from: 75,
        to: 85,
        transform: calculate_position
    },
    fixed_bits: {
        from: 107,
        to: 110,
        options: options_fixed_bits
    },
    source_of_position: {
        from: 111,
        to: 111,
        options: options_source_of_position
    },
    auxiliary_radio_locating_device_code: {
        from: 112,
        to: 112,
        options: options_auxiliary_radio_locating_device_code
    },
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
        assigned_bits[key]["flag"] = options_icons.valid
        assigned_bits[key]["bits"] = bitString.substring(bit_template[key].from - 1, bit_template[key].to)
        
        if(bit_template[key]["options"]) {
            assigned_bits[key]["option"] = check_for_option(assigned_bits[key]["bits"], bit_template[key]["options"])
            if(assigned_bits[key]["option"] == null) {
                assigned_bits[key]["option"] = "Invalid"
                assigned_bits[key]["flag"] = options_icons.invalid
            }
        }
        else if(bit_template[key]["transform"]) {
            assigned_bits[key]["option"] = bit_template[key]["transform"](assigned_bits[key]["bits"], assigned_bits[key]["direction"], assigned_bits[key]["default_value"])
            if(assigned_bits[key]["option"] == "Default Position") {
                assigned_bits[key]["flag"] = options_icons.warning
            }
        }
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
                        '<h5 class="card-title fw-light">' + (section['option'] ? section['option'] : 'Valid') + '</h5>' + 
                        '<p class="card-text"><small class="text-muted">' + section["fromTo"] + '</small></p>' + 
                    '</div>' + 
                    '<div class="card-footer text-muted round-bottom-right">Bit Pattern: ' + section["bits"] + '</div>' + 
                '</div>' + 
            '</div>'
    }, timer);
    timeouts.push(timeout);
}