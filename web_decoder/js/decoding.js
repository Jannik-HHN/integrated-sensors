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
        bits: "",
        fromTo: "Bits 1 - 15",
        option: "",
        icon: ""
    },
    frame_sync: {
        name: "Frame Synchronization",
        bits: "",
        fromTo: "Bits 16 - 24",
        option: "",
        icon: ""
    },
    format_flag: {
        name: "Format Flag",
        bits: "",
        fromTo: "Bit 25",
        option: "",
        icon: ""
    },
    protocol_flag: {
        name: "Protocol Flag",
        bits: "",
        fromTo: "Bit 26",
        option: "",
        icon: ""
    },
    country_code: {
        name: "Country",
        bits: "",
        fromTo: "Bits 27 - 36",
        option: "",
        icon: ""
    },
    protocol_code: {
        name: "Protocol Code",
        bits: "",
        fromTo: "Bits 37 - 40",
        option: "",
        icon: ""
    },
    type_approval: {
        name: "Type Approval Certificate Number",
        bits: "",
        fromTo: "Bits 41 - 50",
        option: "",
        icon: ""
    },
    serial_number: {
        name: "Serial Number",
        bits: "",
        fromTo: "Bits 51 - 64",
        option: "",
        icon: ""
    },
    latitude_data_1: {
        name: "Latitude Position",
        bits: "",
        fromTo: "Bits 65 - 74",
        option: "",
        icon: "",
        default_value: "0111111111",
        direction: "latitude"
    },
    longitude_data_1: {
        name: "Longitude Position",
        bits: "",
        fromTo: "Bits 75 - 85",
        option: "",
        icon: "",
        default_value: "01111111111",
        direction: "longitude"
    },
    fixed_bits: {
        name: "Fixed Bits",
        bits: "",
        fromTo: "Bits 107 - 110",
        option: "",
        icon: ""
    },
    source_of_position: {
        name: "Source of Position",
        bits: "",
        fromTo: "Bit 111",
        option: "",
        icon: ""
    },
    auxiliary_radio_locating_device_code: {
        name: "121.5 MHz Auxiliary Radio Locating Device",
        bits: "",
        fromTo: "Bit 112",
        option: "",
        icon: ""
    },
}

function decode_bits() {
    for(var timeout of timeouts) {
        clearTimeout(timeout)
    }
    timeouts = []

    var bitString = document.getElementById('bitstring').value
    bitString = bitString.replace(/\s+/g, '');
    var counter = 0;

    var content = document.getElementById("info-content");

    if(bitString.length != 144 || bitString.charAt(25) != "0" || check_for_option(bitString.substring(bit_template["protocol_code"].from - 1, bit_template["protocol_code"].to), bit_template["protocol_code"]["options"]) == null) {
        content.innerHTML =
        '<div class="hint text-center mx-5 bit-content position-relative text-danger">' + 
            '<h1 class="display-6"><span class="fw-bold">Uh oh...</span></h1>' + 
            '<h1 class="display-6 fs-2">It looks like this Protocol is <span class="fw-bold">not supported</span>. The ELT Decoder only supports Serial Standard Location Protocols.</h1>'
        '</div>'
        return;
    }

    content.innerHTML = "";

    for(var key in bit_template) {
        assigned_bits[key]["icon"] = options_icons["valid"]
        assigned_bits[key]["bits"] = bitString.substring(bit_template[key].from - 1, bit_template[key].to)
        
        if(bit_template[key]["options"]) {
            assigned_bits[key]["option"] = check_for_option(assigned_bits[key]["bits"], bit_template[key]["options"])
            if(assigned_bits[key]["option"] == null) {
                assigned_bits[key]["option"] = "Invalid"
                assigned_bits[key]["icon"] = options_icons["invalid"]
            }
        }
        else if(bit_template[key]["transform"]) {
            assigned_bits[key]["option"] = bit_template[key]["transform"](assigned_bits[key]["bits"], assigned_bits[key]["direction"], assigned_bits[key]["default_value"])
            if(assigned_bits[key]["option"] == "Default Position") {
                assigned_bits[key]["icon"] = options_icons["warning"]
            }
        }
        create_card(content, assigned_bits[key], counter*150)
        counter++;
    }
}

function check_for_option(bitString, options) {
    if(options[bitString]) {
        return options[bitString]
    }
    return null
}

function create_card(element, section, timer) {

    var newDiv = document.createElement("div");
    newDiv.classList.add("bit-content-container", "card", "d-inline-block", "m-3", "h-100", "border-0")
    element.appendChild(newDiv)

    var timeout = setTimeout(() => {
        newDiv.innerHTML =
            '<div class="bit-content shadow position-relative row g-0 round">' + 
                '<div class="col-3 d-flex justify-content-center shadow round-start">' + 
                    '<div class="align-self-center d-flex flex-column">' + 
                        '<i class="fas icon ' + section["icon"]["icon"]  + '"></i>' + 
                        '<span class="badge mt-3 ' + section["icon"]["badge"]  + '">' + section["icon"]["text"]  + '</span>' +
                    '</div>' + 
                '</div>' + 
            '<div class="col-9">' + 
                '<div class="card-header fw-bold round-top-right">' + section["name"] + '</div>' + 
                    '<div class="card-body">' + 
                        '<h5 class="card-title">' + (section['option'] ? section['option'] : 'Valid') + '</h5>' + 
                        '<p class="card-text"><small class="text-muted">' + section["fromTo"] + '</small></p>' + 
                    '</div>' + 
                    '<div class="card-footer text-muted round-bottom-right">Bit Pattern: ' + section["bits"] + '</div>' + 
                '</div>' + 
            '</div>'
    }, timer);
    timeouts.push(timeout);
}

function empty_input() {
    document.getElementById('bitstring').value = "";
    var content = document.getElementById("info-content");
    content.innerHTML = 
    '<div class="hint text-center mx-5 bit-content position-relative">' + 
        '<h1 class="display-6 fs-2">Enter a Bit String and hit <span class="fw-bold">Decode</span> to decode Standard Location Protocols</h1>' + 
    '</div>'
}