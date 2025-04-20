function getRegexForLanguage(language) {
    switch(language) {
        case "javascript":
            return /\/\*[\s\S]*?\*\/|\/\/.*(?=[\n\r])/g;
        case "python":
            return /#[^\n]*/g;
        case "html":
            return /<!--[\s\S]*?-->/g;
        case "sql":
            return /--.*(?=[\n\r])/g;
        case "lisp":
            return /;[^\n]*/g;
        case "c":
        case "csharp":
        case "java":
            return /\/\*[\s\S]*?\*\/|\/\/.*(?=[\n\r])/g;
        default:
            return /\/\*[\s\S]*?\*\/|\/\/.*(?=[\n\r])|#[^\n]*|--.*(?=[\n\r])|;[^\n]*|<!--[\s\S]*?-->/g;
    }
}

function autoDetectLanguage(code) {
    if(code.indexOf('def ') !== -1 || code.indexOf('import ') !== -1 || code.indexOf("if __name__") !== -1) return "python";
    if(code.indexOf('<!--') !== -1) return "html";
    if(code.indexOf("#include") !== -1 || code.indexOf("int main(") !== -1) return "c";
    if(code.indexOf("using System") !== -1) return "csharp";
    if(code.indexOf("public static void main(") !== -1) return "java";
    if(code.indexOf('function') !== -1) return "javascript";
    if(code.indexOf('--') !== -1) return "sql";
    if(code.indexOf(';') !== -1) return "lisp";
    return "javascript";
}

function solveSimpleChallenge(code, regex) {
    // Remove comments completely
    var newCode = code.replace(regex, '');
    // Collapse multiple consecutive newlines into a single newline
    return newCode.replace(/(\r?\n){2,}/g, '\n');
}

function processRemoval(lang, code) {
    var regex = getRegexForLanguage(lang.toLowerCase());
    var result = solveSimpleChallenge(code, regex);
    document.getElementById("result").textContent = result;
}

document.getElementById("removeBtn").addEventListener("click", function() {
    var code = document.getElementById("code").value;
    var lang = document.getElementById("language").value;
    if(lang === "auto") {
        var detected = autoDetectLanguage(code);
        var modal = document.getElementById("customModal");
        var backdrop = document.getElementById("modalBackdrop");
        var modalSelect = document.getElementById("modalLanguage");
        modalSelect.value = detected;
        modal.style.display = "block";
        backdrop.style.display = "block";

        document.getElementById("modalOk").onclick = function() {
            modal.style.display = "none";
            backdrop.style.display = "none";
            lang = document.getElementById("modalLanguage").value;
            processRemoval(lang, code);
        };

        document.getElementById("modalCancel").onclick = function() {
            modal.style.display = "none";
            backdrop.style.display = "none";
        };
    } else {
        processRemoval(lang, code);
    }
});