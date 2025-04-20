// Language detection and regex functions
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
    return "cannot detect";
}

// Core functionality
function solveSimpleChallenge(code, regex) {
    // Show loading state
    const resultElement = document.getElementById("result");
    resultElement.textContent = "Processing...";
    
    // Use setTimeout to allow UI to update before processing
    setTimeout(() => {
        // Remove comments completely
        var newCode = code.replace(regex, '');
        // Collapse multiple consecutive newlines into a single newline
        newCode = newCode.replace(/(\r?\n){2,}/g, '\n');
        
        // Update the result with animation
        resultElement.textContent = newCode;
        resultElement.classList.add('highlight');
        
        // Remove the highlight class after animation completes
        setTimeout(() => {
            resultElement.classList.remove('highlight');
        }, 1500);
    }, 100);
}

function processRemoval(lang, code) {
    var regex = getRegexForLanguage(lang.toLowerCase());
    solveSimpleChallenge(code, regex);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    // Remove Comments Button
    document.getElementById("removeBtn").addEventListener("click", function() {
        var code = document.getElementById("code").value;
        if (!code.trim()) {
            showToast("Please enter some code first!");
            return;
        }
        
        var lang = document.getElementById("language").value;
        if(lang === "auto") {
            var detected = autoDetectLanguage(code);
            var modal = document.getElementById("customModal");
            var backdrop = document.getElementById("modalBackdrop");
            var modalSelect = document.getElementById("modalLanguage");
            
            if (detected === "cannot detect") {
                modalSelect.value = "javascript"; // Default to JavaScript if can't detect
            } else {
                modalSelect.value = detected;
            }
            
            // Show elements first
            modal.style.display = "block";
            backdrop.style.display = "block";
            
            // Then trigger animation with a tiny delay
            setTimeout(function() {
                backdrop.classList.add('visible');
                modal.classList.add('visible');
            }, 10);

            document.getElementById("modalOk").onclick = function() {
                closeModal();
                lang = document.getElementById("modalLanguage").value;
                processRemoval(lang, code);
            };

            document.getElementById("modalCancel").onclick = function() {
                closeModal();
            };
        } else {
            processRemoval(lang, code);
        }
    });
    
    function closeModal() {
        var modal = document.getElementById("customModal");
        var backdrop = document.getElementById("modalBackdrop");
        
        backdrop.classList.remove('visible');
        modal.classList.remove('visible');
        
        // Wait for animation to finish before hiding
        setTimeout(function() {
            modal.style.display = "none";
            backdrop.style.display = "none";
        }, 300);
    }
    
    // Clear Button
    document.getElementById("clearBtn").addEventListener("click", function() {
        document.getElementById("code").value = "";
        document.getElementById("result").textContent = "The code without comments will appear here...";
    });
    
    // Copy to Clipboard Button
    document.getElementById("copyBtn").addEventListener("click", function() {
        const result = document.getElementById("result").textContent;
        if (result && result !== "The code without comments will appear here...") {
            navigator.clipboard.writeText(result).then(() => {
                showToast("Copied to clipboard!");
            });
        }
    });
    
    // Download Button
    document.getElementById("downloadBtn").addEventListener("click", function() {
        const result = document.getElementById("result").textContent;
        if (result && result !== "The code without comments will appear here...") {
            const blob = new Blob([result], {type: "text/plain"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "code_without_comments.txt";
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    });
    
    // File Upload
    document.getElementById("fileInput").addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById("code").value = event.target.result;
                
                // Auto-select language based on file extension
                const fileName = file.name.toLowerCase();
                const langSelect = document.getElementById("language");
                
                if (fileName.endsWith(".js")) langSelect.value = "javascript";
                else if (fileName.endsWith(".py")) langSelect.value = "python";
                else if (fileName.endsWith(".html") || fileName.endsWith(".htm")) langSelect.value = "html";
                else if (fileName.endsWith(".sql")) langSelect.value = "sql";
                else if (fileName.endsWith(".lisp")) langSelect.value = "lisp";
                else if (fileName.endsWith(".c") || fileName.endsWith(".cpp") || fileName.endsWith(".h")) langSelect.value = "c";
                else if (fileName.endsWith(".cs")) langSelect.value = "csharp";
                else if (fileName.endsWith(".java")) langSelect.value = "java";
                else langSelect.value = "auto";
            };
            reader.readAsText(file);
        }
    });
    
    // Example Code Snippets
    const examples = {
        javascript: `// This is a JavaScript comment\nfunction helloWorld() {\n  // Say hello\n  console.log("Hello World!");\n  /* This is a\n     multiline comment */\n  return true;\n}`,
        python: `# This is a Python comment\ndef hello_world():\n    # Say hello\n    print("Hello World!")\n    return True\n\n# Call the function\nhello_world()`,
        html: `<!-- This is an HTML comment -->\n<html>\n  <head>\n    <title>Example</title>\n    <!-- Header comment -->\n  </head>\n  <body>\n    <!-- Body comment -->\n    <h1>Hello World!</h1>\n  </body>\n</html>`
    };
    
    document.querySelectorAll(".example-chip").forEach(chip => {
        chip.addEventListener("click", function() {
            const lang = this.dataset.lang;
            document.getElementById("code").value = examples[lang];
            document.getElementById("language").value = lang;
        });
    });
    
    // Theme Toggle
    document.getElementById("themeToggle").addEventListener("click", function() {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        const icon = document.querySelector("#themeToggle i");
        if (theme === "dark") {
            icon.className = "fas fa-sun";
        } else {
            icon.className = "fas fa-moon";
        }
    }
    
    // Toast Notification
    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");
        
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }
});