const { spawn } = require("child_process");
const path = require("path");

async function runPythonScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    let py;
    try {
      py = spawn("python", [scriptPath, ...args]);
    } catch (spawnErr) {
      return reject(new Error(`Cannot spawn python: ${spawnErr.message}`));
    }

    let output = "";
    let error = "";

    // ✅ BẮT BUỘC: Handle 'error' event để tránh crash server
    py.on("error", (err) => {
      reject(new Error(`Python spawn error: ${err.message}`));
    });

    py.stdout.on("data", (data) => (output += data.toString()));
    py.stderr.on("data", (data) => {
      const str = data.toString();
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
