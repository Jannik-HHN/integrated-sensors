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
        to: 26
    },
    country_code: {
        from: 27,
        to: 36,
        options: options_country_code
    },
    protocol_code: {
        from: 37,
        to: 40
    },
    other_bits: {
        from: 38,
        to: 144
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
        name: "Protocol",
        bits: "",
        fromTo: "Bits 37 - 40",
        option: "",
        icon: ""
    },
    other_bits: {
        name: "Other",
        bits: "",
        fromTo: "Bits 38 - 144",
        option: "",
        icon: ""
    },
}

function decode_bits() {
    var content = document.getElementById("info-content");
    content.innerHTML = "";

    var bitString = document.getElementById('bitstring').value
    bitString = bitString.replace(/\s+/g, '');
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
        
        create_card(content, assigned_bits[key])
    }
}

function check_for_option(bitString, options) {
    if(options[bitString]) {
        return options[bitString]
    }
    return null
}

function create_card(element, section) {
    element.innerHTML += 
    '<div class="card d-inline-block m-3 h-100" style="width: 500px;">' +
        '<div class="row g-0">' + 
            '<div class="col-md-4 d-flex justify-content-center border-end">' + 
                '<div class="align-self-center">' + 
                    '<i class="fas icon ' + section["icon"]  + '"></i>' + 
                '</div>' + 
            '</div>' + 
        '<div class="col-md-8">' + 
            '<div class="card-header fw-bold">' + section["name"] + '</div>' + 
                '<div class="card-body">' + 
                    '<h5 class="card-title">' + (section['option'] ? section['option'] : 'Nothing') + '</h5>' + 
                    '<p class="card-text"><small class="text-muted">' + section["fromTo"] + '</small></p>' + 
                '</div>' + 
                '<div class="card-footer text-muted">' + section["bits"] + '</div>' + 
            '</div>' + 
        '</div>' + 
    '</div>' 
}