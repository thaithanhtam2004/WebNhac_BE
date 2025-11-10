const { spawn } = require("child_process");
const path = require("path");



async function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const py = spawn("python", [scriptPath, ...args]);

    let output = "";
    let error = "";

    py.stdout.on("data", (data) => (output += data.toString()));
    py.stderr.on("data", (data) => {
      const str = data.toString();
      // Bỏ cảnh báo DeprecationWarning khỏi lỗi
      if (!str.includes("DeprecationWarning")) error += str;
    });

    py.on("close", (code) => {
      if (code !== 0 || error) {
        return reject(new Error(`Python error: ${error}`));
      }
      try {
        const json = JSON.parse(output);
        resolve(json);
      } catch (e) {
        reject(new Error(`JSON parse error: ${e.message}`));
      }
    });
  });
}

module.exports = { runPythonScript };
