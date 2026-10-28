
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../../config/draft.config");

const GEMINI_API_KEY = config.GEMINI_API_KEY;

let genAI, model;
if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

async function generatePetition(input) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined. Please add it to your environment variables.");
    }

    const { client, accusedDetails, court, relevantActsAndSections, party1Label, party2Label, keyPoints, advocateDetails, draftTypeName, draftCategoryName, petitionType = "PETITION", clientParty = "party1Label", clients = client, caseNumberDetails = [], fee } = input;

    const documentType = draftTypeName;
    const caseType = `${draftCategoryName} ${draftTypeName}`;

    const formattedActsAndSections = (relevantActsAndSections || [])
        .map(item => `${(item?.sections || []).join(", ")} of ${item?.actName || ''}`)
        .filter(s => s.trim() !== "")
        .join("; ");

    const petitionPrompt = `
Generate the *body content* for a bail petition to be filed under *Indian law* before a competent court in *${court.city}, ${court.state}, specifically adhering to the **Kerala court style** as used in a Judicial First Class Magistrate Court. The output must use formal legal language, structured numbered paragraphs (1., 2., 3., etc.), and a humble tone, suitable for a bail application under Section ${formattedActsAndSections}. The content should include the case details followed by a list of documents.

---
### Case Information:
- *Case Type*: ${caseType}
- *Relevant Provisions*: ${formattedActsAndSections}
- *Court*: ${court.courtName}, ${court.address}, ${court.city}, ${court.state}

---
### Parties Involved:
- *Petitioner/1st Accused*: ${client.length > 0 && client[0]?.name}, ${client.length > 0 && client[0]?.parent_relation} ${client.length > 0 && client[0]?.parent_name || 'Not Specified'}, Age ${client.length > 0 && client[0]?.age}, Occupation: ${client.length > 0 && client[0]?.occupation}, Address: ${client.length > 0 && client[0]?.address}
- *Respondent/Prosecution*: ${accusedDetails.length > 0 && accusedDetails[0]?.name}, ${accusedDetails.length > 0 && accusedDetails[0]?.occupation}, Represented by the Assistant Public Prosecutor, ${court.city}
- *Advocates*: Adv. ${advocateDetails.username || advocateDetails.name}${advocateDetails.additionalAdvocates ? ', ' + advocateDetails.additionalAdvocates.map((adv) => 'Adv. ' + adv.name).join(', ') : ''}, Address: ${advocateDetails.address || 'Not Specified'}, ${advocateDetails.city || ''}, Contact: ${advocateDetails.phone || ''}, Email: ${advocateDetails.email || ''}

---
### Document Generation Instructions:

1. *Introduction Section*:
   - Begin with a contextual narrative introducing the petitioner (1st accused), their background (e.g., occupation, community status), and the context of the alleged crime .
   - Mention the charges under ${formattedActsAndSections} and briefly outline the prosecution's allegations.

2. *Statement of Facts*:
   - **CRITICAL**: You MUST include ALL the provided key points in the petition. Each key point must be converted into a separate numbered paragraph (1., 2., 3., etc.). Do not omit, summarize, or combine any key points.
     - Key Points to be included (ALL must be covered):
       - ${keyPoints.join("\n       - ")}
   - Each key point should be expanded into a full paragraph, integrating incident facts, events, and the petitioner's defense (e.g., denying involvement, alleging false complaints, or providing alibis).
   - Highlight any prior complaints filed by the petitioner or their family against the complainant to show context or motive (e.g., revenge by the complainant).
   - Include the petitioner's personal circumstances (e.g., sole breadwinner, family responsibilities) to support the bail plea.
   - **IMPORTANT**: Ensure that every single key point listed above is addressed in a separate numbered paragraph. The total number of numbered paragraphs should correspond to the number of key points provided.

3. *Legal Grounds*:
   - Reference ${formattedActsAndSections} naturally within the narrative where applicable.
   - Argue the petitioner’s innocence, willingness to cooperate with the investigation, and lack of criminal history.
   - Note that further detention serves no legal purpose if the investigation is nearly complete.

4. *List of Documents*:
   - Conclude with a section titled "LIST OF DOCUMENTS" (in all caps, without numbering), listing relevant documents supporting the bail application (e.g., medical records, prior complaints, or other evidence), inferred from the key points and case context. Do not rely on external document lists.

5. *Formatting Rules*:
   - Use numbered paragraphs (1., 2., 3., etc.) for the case details, without bullet points or headings.
   - Include the "LIST OF DOCUMENTS" section at the end.
   - The items in the "LIST OF DOCUMENTS" section should be displayed as a numbered list using <ol><li>...</li></ol>.
   - Do not include court headers, party details, prayer, or signature blocks.
   - Use formal and respectful language suitable for Kerala courts, with a humble tone.
   - Ensure the body reads like a complete court-ready document, tailored to Kerala judicial practice.
   - All content must be strictly articulated using **formal legal phrases or terms** customary in **Indian judicial proceedings**, especially in **Kerala courts**. **Casual, colloquial, or conversational language must be replaced** with **precise legal terminology**.

---
Output only the body content for the petition (under "MOST RESPECTFULLY SHOWETH:" followed by "LIST OF DOCUMENTS"). Format the numbered paragraphs as an HTML ordered list (<ol><li>...</li></ol>). Do not include explanatory notes, markdown formatting, or additional HTML tags beyond the ordered list.
Avoid all markdown formatting. Do not use triple backticks or language tags like 'html', 'ts', etc.

**FINAL REMINDER**: Every single key point provided must be included as a separate numbered paragraph. Do not omit any key points.
`;

    const affidavitPrompt = `
Generate the *body content* for an affidavit accompanying a bail petition to be filed under *Indian law* before a competent court in *${court.city}, ${court.state}, adhering to the **Kerala court style** as used in a Judicial First Class Magistrate Court. The output must use formal legal language, structured numbered paragraphs (1., 2., 3., etc.), and a humble tone.

---
### Case Information:
- *Case Type*: ${caseType}
- *Relevant Provisions*: ${formattedActsAndSections}
- *Court*: ${court.courtName}, ${court.address}, ${court.city}, ${court.state}

---
### Parties Involved:
- *Affiant*: ${client.length > 0 && client[0]?.name}, ${client.length > 0 && client[0]?.parent_relation} ${client.length > 0 && client[0]?.parent_name}, Age ${client.length > 0 && client[0]?.age}, Address: ${client.length > 0 && client[0]?.address}, Relation to Petitioner: petitoiner
- *Petitioner/1st Accused*: ${client.length > 0 && client[0]?.name}, ${client.length > 0 && client[0]?.parent_relation} ${client.length > 0 && client[0]?.parent_name || 'Not Specified'}, Age ${client.length > 0 && client[0]?.age}, Occupation: ${client.length > 0 && client[0]?.occupation}, Address: ${client.length > 0 && client[0]?.address}
- *Respondent/Prosecution*: ${accusedDetails.length > 0 && accusedDetails[0]?.name}, ${accusedDetails.length > 0 && accusedDetails[0]?.occupation}, Represented by the Assistant Public Prosecutor, ${court.city}
- *Advocates*: Adv. ${advocateDetails.username || advocateDetails.name}${advocateDetails.additionalAdvocates ? ', ' + advocateDetails.additionalAdvocates.map((adv) => 'Adv. ' + adv.name).join(', ') : ''}, Address: ${advocateDetails.address || ''}, ${advocateDetails.city || ''}, Contact: ${advocateDetails.phone || ''}, Email: ${advocateDetails.email || ''}

---
### Document Generation Instructions:
1. *Affidavit Content*:
   - State the affiant’s identity and relation to the petitioner (e.g., self, brother).
   - Affirm the affiant’s competence to swear the affidavit and knowledge of the case facts.
   - Declare that this is the first bail application before the court, or infer and disclose any prior applications based on the key points: ${keyPoints.join("; ")}.
   - Confirm authorization of advocates to file the bail application.
   - Affirm that all facts in the petition are true to the best of the affiant’s knowledge, belief, and information.

2. *Formatting Rules*:
   - Use numbered paragraphs (1., 2., 3., etc.) without bullet points or headings.
   - Do not include court headers, party details, or signature blocks.
   - Ensure the tone is formal, humble, and consistent with Kerala judicial practice.
   - All content must be strictly articulated using **formal legal phrases or terms** customary in **Indian judicial proceedings**, especially in **Kerala courts**.
---
Output only the body content for the affidavit. Format the numbered paragraphs as an HTML ordered list (<ol><li>...</li></ol>). Do not include explanatory notes, markdown formatting, or additional HTML tags beyond the ordered list.
Avoid all markdown formatting. Do not use triple backticks or language tags like 'html', 'ts', etc.
`;

    let petitionText, affidavitText;

    try {
        const petitionResult = await model.generateContent(petitionPrompt);
        petitionText = petitionResult.response.text();

        const affidavitResult = await model.generateContent(affidavitPrompt);
        affidavitText = affidavitResult.response.text();

        const MAX_AFFIDAVIT_CHARS = 3500;
        if (affidavitText && affidavitText.length > MAX_AFFIDAVIT_CHARS) {
            let cutIndex = affidavitText.lastIndexOf('</li>', MAX_AFFIDAVIT_CHARS);
            if (cutIndex === -1 || cutIndex < MAX_AFFIDAVIT_CHARS * 0.7) {
                cutIndex = MAX_AFFIDAVIT_CHARS;
            } else {
                cutIndex += 5;
            }
            affidavitText = affidavitText.slice(0, cutIndex) + '<li>... (Content truncated to fit one page)</li>';
        }
    } catch (error) {
        console.error("Gemini generation failed:", error);
        throw new Error(`Failed to generate ${documentType.toLowerCase()}: ${error.message || "Unknown error"}`);
    }

    const firstClient = clients && clients.length > 0 ? clients[0] : null;
    const firstOppositeParty = accusedDetails && accusedDetails.length > 0 ? accusedDetails[0] : null;
    const firstCaseNumber = caseNumberDetails && caseNumberDetails.length > 0 ? caseNumberDetails[0] : null;

    let firstPartyLabel = party1Label;
    let secondPartyLabel = party2Label;
    let firstPartyDetails = firstClient;
    let secondPartyDetails = firstOppositeParty;
    if (clientParty === "party2Label") {
        firstPartyLabel = party2Label;
        secondPartyLabel = party1Label;
        firstPartyDetails = firstOppositeParty;
        secondPartyDetails = firstClient;
    }

    const firstPageTemplate = `
<div style="width: 21cm; height: 29.7cm; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); position: relative;">
    <div style="border-right: 1px solid transparent;"></div>
    <div style="padding: 24px; display: flex; flex-direction: column; line-height: 1.5; font-size: 16px; box-sizing: border-box; height: 100%; min-height: 29.7cm; position: relative;">
        <div class="title" style="text-align: center; margin-bottom: 32px;">
            <h2 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 2px;">BEFORE THE HONOURABLE</h2>
            <h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 2px;">${court.courtName.toUpperCase()}</h3>
            <h4 style="font-size: 1.125rem; font-weight: bold;">${court.city.toUpperCase()}</h4>
        </div>
        <div style="margin: 8px; padding: 0px;">
            ${caseNumberDetails.map((caseDetail, index) => `
                <p style="font-size: 16px; margin: 0; text-align: center;">
                ${caseDetail.caseType} No. ${caseDetail.caseNo} of ${caseDetail.caseNoOf}
                </p>
                ${index !== caseNumberDetails.length - 1 ? `<p style="font-size: 16px; margin: 0; text-align: center;">IN</p>` : ""}
            `).join("")}
        </div>
        <div style="margin-bottom: 32px;">
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: nowrap;">
                    <p style="font-size: 16px; font-weight: 600; white-space: nowrap; margin: 0;">
                        ${clientParty === "party1Label" ? `${clients[0].name}${clients.length > 1 ? ' & others' : ''}` : `${accusedDetails[0].name}${accusedDetails.length > 1 ? ' & others' : ''}`} :
                    </p>
                    <p style="font-size: 16px; font-weight: 600; white-space: nowrap; margin: 0;">${party1Label}</p>
                </div>
                <div style="text-align: center; font-size: 16px; font-weight: 600;">
                    <p>Vs</p>
                </div>
                <div style="display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: nowrap;">
                    <p style="font-size: 16px; font-weight: 600; white-space: nowrap; margin: 0;">
                        ${clientParty === "party2Label" ? `${clients[0].name}${clients.length > 1 ? ' & others' : ''}` : `${accusedDetails[0].name}${accusedDetails.length > 1 ? ' & others' : ''}`} :
                    </p>
                    <p style="font-size: 16px; font-weight: 600; white-space: nowrap; margin: 0;">${party2Label}</p>
                </div>
            </div>
        </div>
        <div style="text-align: center; margin-bottom: 22px;">
            <h3 style="font-size: 1.125rem; font-weight: bold;">${petitionType.toUpperCase()}</h3>
            <h4 style="font-size: 1rem; font-weight: bold; margin-bottom: 4px;">SUBMITTED UNDER ${formattedActsAndSections.toUpperCase()}</h4>
            <p style="margin-top:20px; font-size: 16px;">Fees Rs. ${fee}</p>
        </div>
        <div style="text-align: center; margin-top: 60px; margin-bottom:32px">
            <ul style="list-style-type: none; padding: 0; margin: 0 0 4px 0; font-size: 1rem;">
                <li>Adv. ${advocateDetails.username || advocateDetails.name}</li>
                ${(advocateDetails.additionalAdvocates || []).map((adv) => `<li>Adv. ${adv.name}</li>`).join('')}
            </ul>
        </div>
    </div>
</div>
`;

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${draftCategoryName} ${draftTypeName} Draft</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.8; text-align: justify; }
        .page { padding: 40px; box-sizing: border-box; page-break-before: always; position: relative; min-height: 1000px; }
        .title { text-align: center; font-weight: bold; margin-bottom: 20px; }
        .cause-title { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; margin-bottom: 20px; }
        .section { margin-bottom: 20px; page-break-inside: auto; }
        .signature { margin-top: 20px; text-align: justify; page-break-inside: avoid; }
        .signature .right { text-align: right; }
        ol { padding-left: 20px; }
        li { margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="page">
        <div class="title">
            <strong>BEFORE THE HONOURABLE ${court.courtName.toUpperCase()}</strong><br>
            <strong>${court.city.toUpperCase()}</strong><br>
            ${firstCaseNumber ? `${firstCaseNumber.caseType} No. ${firstCaseNumber.caseNo} of ${firstCaseNumber.caseNoOf}` : ''}
        </div>
        <div class="cause-title">
            <strong>${firstPartyLabel} :</strong>
            <strong>${firstPartyDetails ? `${firstPartyDetails.name}, ${firstPartyDetails.parent_relation || ''} ${firstPartyDetails.parent_name || ''}, aged ${firstPartyDetails.age}, ${firstPartyDetails.occupation},<br>Residing at ${firstPartyDetails.address}` : ''}<br><br></strong>
            <strong>VS</strong><br>
            <strong>${secondPartyLabel} :</strong>
            <strong>${secondPartyDetails ? `${secondPartyDetails.name}, ${secondPartyDetails.occupation},<br>Residing at ${secondPartyDetails.address}` : ''},<br> </strong>  
            Represented by the Assistant Public Prosecutor, ${court.city}
        </div>
        <div class="section">
            <strong style="text-align: center;">${petitionType ? petitionType.toUpperCase() : draftCategoryName.toUpperCase()} ${draftTypeName.toUpperCase()} FILED UNDER SECTION ${formattedActsAndSections.toUpperCase()}</strong>
        </div>
        <div class="section">
            <ol>${petitionText}</ol>
        </div>
        <div class="signature">
            <strong>Dated this the ${new Date().getDate()}th day of ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}</strong><br><br>
            <div class="right">
                Adv. ${advocateDetails.username || advocateDetails.name}<br>
                Advocates for ${firstPartyLabel}
            </div>
        </div>
    </div>
    <div class="page">
        <div class="title">
            <strong>BEFORE THE HONOURABLE ${court.courtName.toUpperCase()}</strong><br>
            <strong>${court.city.toUpperCase()}</strong><br>
            ${firstCaseNumber ? `${firstCaseNumber.caseType} No. ${firstCaseNumber.caseNo} of ${firstCaseNumber.caseNoOf}` : ''}
        </div>
        <div class="cause-title">
            <strong>${firstPartyLabel} :</strong>
            <strong>${firstPartyDetails ? `${firstPartyDetails.name}, ${firstPartyDetails.parent_relation || ''} ${firstPartyDetails.parent_name || ''}, aged ${firstPartyDetails.age}, ${firstPartyDetails.occupation},<br>Residing at ${firstPartyDetails.address}` : ''}<br><br></strong>
            <strong>VS</strong><br>
            <strong>${secondPartyLabel} :</strong>
            <strong>${secondPartyDetails ? `${secondPartyDetails.name}, ${secondPartyDetails.occupation},<br>Residing at ${secondPartyDetails.address}` : ''},<br> </strong>  
            Represented by the Assistant Public Prosecutor, ${court.city}
        </div>
        <div class="section">
            <div style="display: flex; justify-content: center; align-items: center; text-align: center;">
                <strong>AFFIDAVIT</strong> <br>
            </div>
            <ol>${affidavitText}</ol>
        </div>
        <div class="signature">
            <strong>All the facts stated above are true and correct to the best of my knowledge, belief, and information.</strong><br><br>
            <strong>Dated this the ${new Date().getDate()}th day of ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}</strong><br><br>
            <div class="right">
                [Signature of Affiant]<br>
                ${firstPartyDetails ? firstPartyDetails.name : ''}<br><br>
            </div>
            Solemnly affirmed and signed before me by the deponent, who is personally known to me, on this the ${new Date().getDate()}th day of ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}, at ${court.city.toUpperCase()}.<br><br>
            <div class="right">
                Adv. ${advocateDetails.username || advocateDetails.name}<br>
                Advocates for ${firstPartyLabel}
            </div>
        </div>
    </div>
</body>
</html>
`;

    return { htmlTemplate, firstPageTemplate };
}

module.exports = { generatePetition };
