// Convert Bits to Number
var convert_bits_to_number = function bits_to_number(section) {
    var bit_pattern = section["bits"]
    return parseInt(bit_pattern, 2)
}

// Convert Bits to Hex
var convert_bits_to_hex = function bits_to_hex(bit_pattern) {
    var hex_decoded = ""
    for (var i = 0; i < bit_pattern.length; i += 4) {
        if (i % 20 == 0) hex_decoded += " "
        hex_decoded += (parseInt(bit_pattern.substring(i, i + 4), 2).toString(16)).toUpperCase()
    }
    return hex_decoded.trim()
}

// Convert Bits to Position Data
var calculate_position = function bits_to_position(section) {
    var bit_pattern = section["bits"]
    var orientation = section["orientation"]
    var accuracy = section["accuracy"]
    var direction_section = options_direction[accuracy][orientation]
    var direction = direction_section[bit_pattern.charAt(0)]
    var position_deg, position_min, position_sec

    if (bit_pattern == direction_section["default"]) {
        section["flag"] = options_flags.warning
        return "Default Position"
    }

    if(accuracy == "coarse") {
        position_deg = parseInt(bit_pattern.substring(1), 2) * options_position_increments["degrees"]
        if(position_deg > direction_section["max"]) {
            section["flag"] = options_flags.invalid
            return
        }
        return section["option"] = position_deg + "° " + direction
    }

    if(accuracy == "offset") {
        position_min = parseInt(bit_pattern.substring(1, 6), 2) * options_position_increments["minutes"]    // 0-30 min
        position_sec = parseInt(bit_pattern.substring(6), 2) * options_position_increments["seconds"]       // 0-56 min

        if(position_min > 30 || position_sec > 56) {
            section["flag"] = options_flags.invalid
            return
        }

        return section["option"] = direction + position_min + "' " + position_sec + "\" "
    }

    console.log(position)
}

// Check for the correspondig Value of the Bit Pattern in the provided Bit Pattern Options
function check_for_option(section, options) {
    var bitString = section.bits
    if(typeof options == "string") {
        return options
    }
    if(options instanceof Function) {
        return options(section)
    }
    if(options instanceof Object) {
        if(options[bitString]) return options[bitString]
        else section["flag"] = options_flags.invalid
    }
    return undefined
}

// Checks if the Bit String is valid and uses the correct Protocol for Decoding
function check_for_valid_bitstring(bitString) {
    var protocol = bit_sections.protocol_code;
    if (bitString.length != 144)
        return false;
    if (bitString.charAt(25) != "0")
        return false;
    if (!protocol.options[bitString.substring(protocol.from - 1, protocol.to)])
        return false;
    return true;
}

// Highlights the Bit Pattern inside the Input Field
function select_bits(from, to) {
    document.getElementById('bitstring').focus();
    document.getElementById('bitstring').setSelectionRange(from, to);
}

// Clears the input and resets the container
function empty_input() {
    document.getElementById('bitstring').value = "";
    document.getElementById("info-content").innerHTML =
        '<div class="hint text-center mx-5 bit-content position-relative">' +
            '<h1 class="display-6 fs-2">Enter a Bit String and hit <span class="fw-bold">Decode</span> to decode Standard Location Protocols</h1>' +
        '</div>'
}

function create_from_to_string(val_from, val_to) {
    return (val_from == val_to) ? ("Bit " + val_from) : ("Bits " + val_from + " - " + val_to)
}

// 0111111111    01111111111
// 0001111111 (127) = 31,75   01100111111 (831) =207,75

// 1 degree = 60 minutes
// 1 minute = 60 seconds
// degree (°), minute ('), seconds (")
// Latitude  [ -90; +90]
// Longitude [-180; 180]