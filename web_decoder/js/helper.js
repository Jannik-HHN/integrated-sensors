// Convert Bits to Number
var convert_bits = function bits_to_number(section) {
    var bit_pattern = section["bits"]
    return parseInt(bit_pattern, 2)
}

// Convert Bits to Number
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
    var direction = section["direction"]
    var default_value = section["default_value"]

    if (bit_pattern == default_value) {
        section["flag"] = options_flags.warning
        return "Default Position"
    }
}

// Check for the correspondig Value of the Bit Pattern in the provided Bit Pattern Options
function check_for_option(section, options) {
    console.log(options)
    var bitString = section.bits
    console.log(options instanceof Function)
    if(options instanceof Function) {
        return options(section)
    }
    else if(options instanceof Object) {
        if (options[bitString]) return options[bitString]
    }

    // Return null if no option for the bit pattern exists
    return null
}

// Checks if the Bit String is valid and uses the correct Protocol for Decoding
function check_for_valid_bitstring(bitString) {
    var protocol = bit_template.protocol_code;
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