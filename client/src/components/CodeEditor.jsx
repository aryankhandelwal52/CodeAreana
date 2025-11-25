import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { LANGUAGE_IDS, JUDGE0_URL, JUDGE0_HEADERS } from "./constants";

const STARTER_CODE = {
  javascript: `// JavaScript starter code
console.log("Hello, world!");`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Your code here
    return 0;
}`,
  java: `// Java starter code
public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}`,
};

export default function CodeEditor({ language, setLanguage, code, setCode, onSubmit, problem }) {
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sampleResults, setSampleResults] = useState([]);

  // Initialize starter code when language changes
  useEffect(() => {
    setCode(STARTER_CODE[language] || "");
  }, [language, setCode]);

  // Disable red squiggly warnings (safe)
  const handleEditorMount = (editor, monaco) => {
    if (monaco && monaco.languages && monaco.languages.typescript) {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
    }
  };

  // Run sample/hidden tests
  const runTestCases = async (testCases) => {
    const results = [];
    for (let i = 0; i < testCases.length; i++) {
      const { input, expected } = testCases[i];
      const res = await fetch(`${JUDGE0_URL}?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: JUDGE0_HEADERS,
        body: JSON.stringify({
          source_code: code,
          language_id: LANGUAGE_IDS[language],
          stdin: input,
        }),
      });
      const result = await res.json();
      const output = (result.stdout || "").trim();

      results.push({
        passed: output === expected.trim(),
        input,
        expected,
        got: output,
      });
    }
    return results;
  };

  const handleRunCode = async () => {
    if (!code.trim()) return alert("Write some code first!");
    setOutput("Running sample test cases...");
    setRunning(true);

    const results = await runTestCases(problem.sampleTests);
    setSampleResults(results);
    setRunning(false);

    const text = results
      .map(
        (r, i) =>
          `${r.passed ? "✅" : "❌"} Sample Test ${i + 1}\nInput: ${r.input}\nExpected: ${r.expected}\nGot: ${r.got}`
      )
      .join("\n\n");

    setOutput(text);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return alert("Write some code first!");
    setOutput("Submitting and checking all test cases...");
    setRunning(true);

    const allTests = [...problem.sampleTests, ...problem.hiddenTests];
    const results = await runTestCases(allTests);
    setRunning(false);

    const failed = results.filter((r) => !r.passed);
    const summary = results
      .map(
        (r, i) =>
          `${r.passed ? "✅" : "❌"} Test ${i + 1}\nInput: ${r.input}\nExpected: ${r.expected}\nGot: ${r.got}`
      )
      .join("\n\n");

    setOutput(summary);

    if (failed.length === 0) {
      setSubmitted(true);
      onSubmit("submit-success");
    } else {
      alert("Some test cases failed!");
    }
  };

  return (
    <div>
      {/* Language Selector */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          marginBottom: 10,
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      >
        <option value="javascript">JavaScript</option>
        <option value="cpp">C++</option>
        <option value="c">C</option>
        <option value="java">Java</option>
      </select>

      {/* Monaco Editor */}
      <Editor
        height="350px"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          quickSuggestions: false,
          wordBasedSuggestions: false,
          suggestOnTriggerCharacters: false,
          tabCompletion: "off",
          inlineSuggest: { enabled: false },
        }}
      />

      {/* Sample Test Results */}
      <div style={{ marginTop: 15 }}>
        {problem.sampleTests.map((tc, i) => (
          <div key={i}>
            {sampleResults[i]?.passed ? "✅" : ""} <b>Input:</b>{" "}
            {tc.input.replace("\n", " ")} <b>Expected:</b> {tc.expected.trim()}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ marginTop: 10 }}>
        <button
          onClick={handleRunCode}
          disabled={running}
          style={{
            padding: "10px 20px",
            marginRight: 10,
            borderRadius: 6,
            backgroundColor: "#0078d4",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {running ? "Running..." : "Run Code"}
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitted}
          style={{
            padding: "10px 20px",
            borderRadius: 6,
            backgroundColor: submitted ? "#999" : "#15803d",
            color: "#fff",
            border: "none",
            cursor: submitted ? "not-allowed" : "pointer",
          }}
        >
          {submitted ? "Submitted ✅" : "Submit Solution"}
        </button>
      </div>

      {/* Output Console */}
      {output && (
        <pre
          style={{
            background: "#111827",
            color: "#e5e7eb",
            padding: 10,
            borderRadius: 6,
            marginTop: 10,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {output}
        </pre>
      )}
    </div>
  );
}
