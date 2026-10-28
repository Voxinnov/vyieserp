
const path = require('path');
const fs = require('fs');

function yearToWords(year) {
    if (year < 2000) return "Two Thousand";
    return "Two Thousand " + (year - 2000);
}

function dayToOrdinal(day) {
    const ordinals = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth", "Twentieth", "Twenty-First", "Twenty-Second", "Twenty-Third", "Twenty-Fourth", "Twenty-Fifth", "Twenty-Sixth", "Twenty-Seventh", "Twenty-Eighth", "Twenty-Ninth", "Thirtieth", "Thirty-First"];
    return ordinals[day] || day;
}

function dateToString(dateStr) {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = d.getDate();
        const month = d.getMonth();
        const year = d.getFullYear();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return dayToOrdinal(day) + " " + months[month] + ", " + yearToWords(year);
    } catch (e) { return dateStr; }
}

function calculateOptimalSizing(caseNumberDetails, advocateDetails, court, clients, accusedDetails) {
    const caseCount = (caseNumberDetails || []).length;
    const addAdvsCount = (advocateDetails?.additionalAdvocates || []).length;
    const clientCount = (clients || []).length;
    const accusedCount = (accusedDetails || []).length;

    let score = caseCount * 2 + addAdvsCount + clientCount + accusedCount;

    let s = {
        title: 18,
        heading: 18,
        body: 16,
        margin: 25,
        top: 40,
        line: 1.6
    };

    if (score > 15) {
        s.title = 14; s.heading = 14; s.body = 12; s.margin = 10; s.top = 10; s.line = 1.25;
    } else if (score > 10) {
        s.title = 16; s.heading = 16; s.body = 14; s.margin = 15; s.top = 20; s.line = 1.4;
    } else if (score > 6) {
        s.title = 17; s.heading = 17; s.body = 15; s.margin = 20; s.top = 30; s.line = 1.5;
    }

    return s;
}

async function generateVakkalath(input) {
    const {
        clients = [],
        accusedDetails = [],
        court = {},
        caseNumberDetails = [],
        fee = 0,
        clientParty = 'party1Label',
        executionDate = new Date().toISOString(),
        witnesses = [],
        advocateDetails = {},
        party1Label = 'Petitioner',
        party2Label = 'Respondent',
        representedBy = []
    } = input;

    const s = calculateOptimalSizing(caseNumberDetails, advocateDetails, court, clients, accusedDetails);

    // Data Mapping
    const mainAdvName = advocateDetails.username || advocateDetails.name || 'Advocate';
    const mainAdvRoll = advocateDetails.bar_registration_number || advocateDetails.registration_number || '__________';
    const addAdvs = Array.isArray(advocateDetails.additionalAdvocates) ? advocateDetails.additionalAdvocates : [];
    const allAdvs = [{ name: mainAdvName, roll: mainAdvRoll }];
    addAdvs.forEach(adv => {
        allAdvs.push({
            name: adv.name || adv.username || 'Advocate',
            roll: adv.registration_number || adv.bar_registration_number || '__________'
        });
    });

    const advAddr = (advocateDetails.address || '') + ', ' + (advocateDetails.city || '') + ', ' + (advocateDetails.state || '') + ', ' + (advocateDetails.pincode || '');
    const docketAddr = (advocateDetails.address || '') + '<br>' + (advocateDetails.city || '') + '<br>' + (advocateDetails.state || '');

    // Party Logic
    const cNameBase = (clients[0]?.name || 'Petitioner');
    const cName = cNameBase + (clients.length > 1 ? ' & others' : '');
    const aNameBase = (accusedDetails[0]?.name || 'Respondent');
    const aName = aNameBase + (accusedDetails.length > 1 ? ' & others' : '');

    const p1Name = clientParty === 'party1Label' ? cName : aName;
    const p2Name = clientParty === 'party2Label' ? cName : aName;
    const targetPartyLabel = clientParty === 'party1Label' ? party1Label : party2Label;

    const p2Head1 = clientParty === 'party1Label' ? cNameBase : aNameBase;
    const p2Head2 = clientParty === 'party2Label' ? cNameBase : aNameBase;

    // Content Text logic
    const clientDetailsStr = clients.map(c => {
        let text = '<b>' + c.name + '</b>';
        if (c.age) text += ', Aged: ' + c.age;
        if (c.parent_relation && c.parent_name) text += ', ' + c.parent_relation + ' ' + c.parent_name;
        if (c.address) text += ', ' + c.address;
        return text;
    }).join(', ');

    const poaText = (representedBy && representedBy.length > 0 && representedBy[0].representedperson) ? ', power of attorney holder of ' + representedBy[0].representedperson : '';
    const advListText = allAdvs.map(a => 'Adv. ' + a.name).join(', ');
    const pron1 = clients.length === 1 ? "I" : "We";
    const pron2 = clients.length === 1 ? "me" : "us";
    const pron3 = clients.length === 1 ? "my" : "our";
    const isAre = clients.length === 1 ? "is" : "are";

    // HTML Parts
    let casesHtml = '';
    caseNumberDetails.forEach((c, i) => {
        casesHtml += '<p style="margin:0;font-weight:bold;text-align:center;">' + (c.caseType || '') + ' No. ' + (c.caseNo || '') + ' of ' + (c.caseNoOf || '') + '</p>';
        if (i < caseNumberDetails.length - 1) casesHtml += '<p style="margin:0;text-align:center;font-weight:bold;">IN</p>';
    });

    let casesHtmlSmall = '';
    caseNumberDetails.forEach((c, i) => {
        casesHtmlSmall += '<p style="margin:0;text-align:center;">' + (c.caseType || '') + ' No. ' + (c.caseNo || '') + ' of ' + (c.caseNoOf || '') + '</p>';
        if (i < caseNumberDetails.length - 1) casesHtmlSmall += '<p style="margin:0;text-align:center;font-size:10px;">IN</p>';
    });

    const docketAdvsHtml = allAdvs.slice(0, 3).map(a => '<p style="margin: 2px 0; font-weight: 500;">' + a.name + '</p>').join('');
    const signAdvsHtml = allAdvs.slice(0, 4).map(a =>
        '<div style="margin-bottom: 6px;">' +
        '<p style="margin: 0; font-size: 13px;">Roll No: ' + a.roll + '</p>' +
        '<p style="margin: 0; font-weight: bold; font-size: ' + (s.body - 1) + 'px;">' + a.name + '</p>' +
        '</div>'
    ).join('');

    const witnessHtml = witnesses.length > 0
        ? witnesses.map((w, i) => '<div>' + (i + 1) + '. ' + w.name + ', ' + (w.address || '') + '</div>').join('')
        : '1.<br>2.';

    const appointmentHtml =
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + pron1 + ' ' + clientDetailsStr + ' ' + poaText + ', do hereby appoint and retain Sri <b>' + advListText + '</b>, ' +
        'Advocate(s) to appear for ' + pron2 + ' in the above suit (Appeal or Petition and to conduct and prosecute or defend) ' +
        'the same and all proceedings that may be taken in respect of any application for execution of any decree or order passed therein. ' +
        pron1 + ' empower the said Pleader Advocate to appear in all miscellaneous proceeding in the above suit or matter till all ' +
        'decrees or order are fully satisfied or adjusted and to produce in Court any money, documents or valuable security on ' +
        pron3 + ' behalf to apply for their returns and to receive back the same, to apply for and obtain copies of all documents in the record ' +
        'of the proceedings, to draw any money\'s that may be payable to me in the above suit or matter and ' + pron1 + ' do further empower on ' +
        pron3 + ' behalf service of notice of all or any appeals or petitions filed in any court of appeal reference or revision with regard to the ' +
        'said suit or matter, before the disposal of the same in this Honourable Court and ' + pron1 + ' do hereby agree that everything lawfully done ' +
        'or made by the said pleader in the conduct of the suit or matter shall be as valid and binding on me as if done by ' + pron2 + ' in person.';

    // Assembly
    const htmlTemplate = '<!DOCTYPE html><html><head><style>' +
        '@page { size: A4; margin: 0; } ' +
        'body { font-family: "Times New Roman", serif; font-size: ' + s.body + 'px; line-height: ' + s.line + '; text-align: justify; margin: 0; } ' +
        '.page { width: 21cm; height: 29.7cm; padding: 40px 60px; box-sizing: border-box; overflow: hidden; page-break-after: always; } ' +
        '.docket { display: grid; grid-template-columns: 1fr 1fr; height: 29.7cm; } ' +
        '</style></head><body>' +

        // Page 1: Docket
        '<div class="page docket">' +
        '<div></div>' +
        '<div style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; height: 100%; border-left: 1px solid #eee; box-sizing: border-box;">' +
        '<div style="text-align: center; margin-bottom: ' + s.top + 'px;">' +
        '<h2 style="font-size: ' + s.title + 'px; margin: 0;">VAKALATH</h2>' +
        '<h3 style="margin: 5px 0;">BEFORE THE HON\'BLE<br>' + (court.courtName || '').toUpperCase() + '</h3>' +
        '</div>' +
        '<div>' + casesHtml + '</div>' +
        '<div style="text-align: center;">' +
        '<div style="font-weight: bold;">' + p1Name + ' : ' + party1Label + '</div>' +
        '<div style="margin: 5px 0;">Vs</div>' +
        '<div style="font-weight: bold;">' + p2Name + ' : ' + party2Label + '</div>' +
        '</div>' +
        '<div style="text-align: center;">' +
        '<div style="font-size: ' + s.title + 'px; font-weight: bold;">VAKALATH</div>' +
        '<div>for ' + targetPartyLabel + '</div>' +
        '<div style="font-weight: bold; margin-top: 10px;">Fees Rs. ' + fee + '</div>' +
        '</div>' +
        '<div style="text-align: center; margin-top: auto;">' +
        '<div style="font-weight: bold; margin-bottom: 5px;">Advocate(s)</div> ' +
        docketAdvsHtml +
        (allAdvs.length > 3 ? '<p style="margin:0; font-style: italic;">& others</p>' : '') +
        '<div style="font-size: 12px; margin-top: 10px; line-height: 1.2;">' + docketAddr + '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +

        // Page 2: Content
        '<div class="page">' +
        '<h2 style="text-align: center; font-size: ' + s.title + 'px; margin: 0;">VAKALATH</h2>' +
        '<h3 style="text-align: center; margin: 5px 0 15px 0;">BEFORE THE HON\'BLE ' + (court.courtName || '').toUpperCase() + '</h3>' +
        '<div style="margin-bottom: ' + s.margin + 'px;">' +
        casesHtmlSmall +
        '<div style="margin-top: 10px; text-align: center;">' +
        '<p style="margin: 0; font-weight: bold;">' + p2Head1 + ' : ' + party1Label + '</p>' +
        '<p style="margin: 2px 0;">Vs</p>' +
        '<p style="margin: 0; font-weight: bold;">' + p2Head2 + ' : ' + party2Label + '</p>' +
        '</div>' +
        '</div>' +
        '<div style="font-size: ' + s.body + 'px; line-height: ' + s.line + '; margin-bottom: ' + s.margin + 'px;">' +
        '<p style="margin: 0;">' + appointmentHtml + '</p>' +
        '<div style="margin: 10px 0;"><b>Signed this ' + dateToString(executionDate) + '</b></div>' +
        '<div style="text-align: right; font-weight: bold;">' + clients.map(c => c.name).join(', ') + '</div>' +
        '<div style="margin: 10px 0;"><b>Duly executed and signed before me</b></div>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between; align-items: flex-start;">' +
        '<div style="width: 60%;">' +
        '<b>Witness:-</b>' +
        '<div style="font-size: ' + (s.body - 2) + 'px; margin-top: 5px;">' + witnessHtml + '</div>' +
        '<div style="margin-top: 15px; font-size: 12px;">' +
        '<b>The Executants ' + isAre + '</b> personally known to me and this vakalath is signed before me on ' + new Date(executionDate).toLocaleDateString() +
        '</div>' +
        '<div style="margin-top: 15px;">' +
        '<b>Address of Service:</b><br>' + advAddr +
        '</div>' +
        '</div>' +
        '<div style="text-align: center; width: 170px;">' +
        '<p>Advocate(s) __________</p>' +
        signAdvsHtml +
        (allAdvs.length > 4 ? '<p style="font-size: 11px;">& others</p>' : '') +
        '</div>' +
        '</div>' +
        '</div>' +
        '</body></html>';

    return { htmlTemplate, firstPageTemplate: "" };
}

module.exports = { generateVakkalath };
