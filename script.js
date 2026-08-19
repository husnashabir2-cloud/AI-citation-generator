let paperData = null;

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

        let citation = createCitation(style);

        resultBox.innerHTML = `
            <h3>Paper Found</h3>

            <p><strong>Title:</strong> ${title}</p>

            <p><strong>Authors:</strong> ${authors}</p>

            <p><strong>Year:</strong> ${year}</p>

            <p><strong>Journal:</strong> ${journal}</p>

            <p><strong>DOI:</strong> ${doi}</p>

            <hr>

            <h3>Generated Citation</h3>

            <p>${citation}</p>
        `;

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