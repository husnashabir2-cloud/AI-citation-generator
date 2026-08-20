let paperData = null;
let generatedCitation = "";

const doiInput = document.getElementById("doi");
const generateButton = document.querySelector(".card button");
const resultBox = document.querySelector(".result");

generateButton.addEventListener("click", async function () {

    const doi = doiInput.value.trim();
    const style = document.getElementById("citationStyle").value;

    if (doi === "") {
        resultBox.innerHTML = "<p>Please enter a DOI.</p>";
        return;
    }

    resultBox.innerHTML = "<p>Searching Crossref...</p>";

    try {

        const response = await fetch(
            "https://api.crossref.org/works/" + encodeURIComponent(doi)
        );

        if (!response.ok) {
            throw new Error("DOI not found.");
        }

        const data = await response.json();

        paperData = data.message;

        const title = paperData.title
            ? paperData.title[0]
            : "Not available";

        const authors = paperData.author
            ? paperData.author.map(author =>
                `${author.given || ""} ${author.family || ""}`
            ).join(", ")
            : "Not available";

        const year = paperData.published
            ? paperData.published["date-parts"][0][0]
            : "Not available";

        const journal = paperData["container-title"]
            ? paperData["container-title"][0]
            : "Not available";

        generatedCitation = createCitation(style);

        resultBox.innerHTML = `
            <h3>Paper Found</h3>

            <p><strong>Title:</strong> ${title}</p>

            <p><strong>Authors:</strong> ${authors}</p>

            <p><strong>Year:</strong> ${year}</p>

            <p><strong>Journal:</strong> ${journal}</p>

            <p><strong>DOI:</strong> ${doi}</p>

            <hr>

            <h3>Generated Citation</h3>

            <p id="citationText">${generatedCitation}</p>

            <button id="copyButton">
                Copy Citation
            </button>
        `;

        document.getElementById("copyButton").addEventListener(
            "click",
            copyCitation
        );

    } catch (error) {

        resultBox.innerHTML = `
            <p><strong>Error:</strong> ${error.message}</p>
        `;
    }
});


function createCitation(style) {

    const title = paperData.title
        ? paperData.title[0]
        : "";

    const journal = paperData["container-title"]
        ? paperData["container-title"][0]
        : "";

    const year = paperData.published
        ? paperData.published["date-parts"][0][0]
        : "";

    const doi = paperData.DOI || "";

    const volume = paperData.volume || "";

    const issue = paperData.issue || "";

    const pages = paperData.page || "";

    const authors = paperData.author || [];


    if (style === "APA") {

        const authorText = authors.map(author => {

            const family = author.family || "";
            const given = author.given || "";

            const initials = given
                .split(" ")
                .filter(Boolean)
                .map(name => name.charAt(0) + ".")
                .join(" ");

            return `${family}, ${initials}`;

        }).join(", ");

        return `${authorText} (${year}). ${title}. ${journal}, ${volume}${issue ? `(${issue})` : ""}, ${pages}. https://doi.org/${doi}`;
    }


    if (style === "IEEE") {

        const authorText = authors.map(author => {

            const family = author.family || "";
            const given = author.given || "";

            const initials = given
                .split(" ")
                .filter(Boolean)
                .map(name => name.charAt(0) + ".")
                .join(" ");

            return `${initials} ${family}`;

        }).join(", ");

        return `${authorText}, "${title}," ${journal}, vol. ${volume}${issue ? `, no. ${issue}` : ""}${pages ? `, pp. ${pages}` : ""}, ${year}, doi: ${doi}.`;
    }


    if (style === "MLA") {

        const authorText = authors.map(author => {

            return `${author.family || ""}, ${author.given || ""}`;

        }).join(", ");

        return `${authorText}. "${title}." ${journal}, vol. ${volume}${issue ? `, no. ${issue}` : ""}, ${year}, pp. ${pages}. DOI: ${doi}.`;
    }


    return "Citation style not available.";
}


async function copyCitation() {

    try {

        await navigator.clipboard.writeText(generatedCitation);

        const copyButton = document.getElementById("copyButton");

        copyButton.textContent = "Copied!";

        setTimeout(() => {
            copyButton.textContent = "Copy Citation";
        }, 2000);

    } catch (error) {

        alert("Could not copy the citation.");
    }
}
const pdfInput = document.getElementById("pdf");

const analyzePdfButton = document.querySelectorAll(".card button")[1];

analyzePdfButton.addEventListener("click", async function () {

    const file = pdfInput.files[0];

    if (!file) {
        resultBox.innerHTML = "<p>Please select a PDF first.</p>";
        return;
    }

    resultBox.innerHTML = "<p>Reading PDF...</p>";

    const formData = new FormData();

    formData.append("pdf", file);

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/upload-pdf",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "PDF upload failed.");
        }

        resultBox.innerHTML = `
            <h3>PDF Successfully Read</h3>

            <p>
                Your PDF has been uploaded and its text has been extracted.
            </p>

            <hr>

            <p><strong>Extracted Text:</strong></p>

            <div style="
                max-height: 400px;
                overflow-y: auto;
                background: white;
                padding: 15px;
                border-radius: 6px;
            ">
                ${data.text}
            </div>
        `;

    } catch (error) {

        resultBox.innerHTML = `
            <p><strong>Error:</strong> ${error.message}</p>
        `;
    }
});