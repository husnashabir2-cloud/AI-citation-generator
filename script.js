const doiInput = document.getElementById("doi");
const generateButton = document.querySelector(".card button");
const resultBox = document.querySelector(".result");

generateButton.addEventListener("click", async function () {

    const doi = doiInput.value.trim();

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

        const paper = data.message;

        const title = paper.title
            ? paper.title[0]
            : "Not available";

        const authors = paper.author
            ? paper.author.map(author =>
                `${author.given || ""} ${author.family || ""}`
              ).join(", ")
            : "Not available";

        const year = paper.published
            ? paper.published["date-parts"][0][0]
            : "Not available";

        const journal = paper["container-title"]
            ? paper["container-title"][0]
            : "Not available";

        resultBox.innerHTML = `
            <h3>Paper Found</h3>

            <p><strong>Title:</strong> ${title}</p>

            <p><strong>Authors:</strong> ${authors}</p>

            <p><strong>Year:</strong> ${year}</p>

            <p><strong>Journal:</strong> ${journal}</p>

            <p><strong>DOI:</strong> ${doi}</p>
        `;

    } catch (error) {

        resultBox.innerHTML = `
            <p><strong>Error:</strong> ${error.message}</p>
        `;
    }
});