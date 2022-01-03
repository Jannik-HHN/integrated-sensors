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
    for(var timeout of timeouts) {
        clearTimeout(timeout)
    }
    timeouts = []

    var content = document.getElementById("info-content");
    content.innerHTML = "";

    var bitString = document.getElementById('bitstring').value
    bitString = bitString.replace(/\s+/g, '');
    var counter = 0;

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
                        '<h5 class="card-title">' + (section['option'] ? section['option'] : 'Nothing') + '</h5>' + 
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