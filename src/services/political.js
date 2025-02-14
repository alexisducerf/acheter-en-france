import axios from 'axios';

export const getLegislativesElectionResults = async (code_insee) => {
  const sheetID = "1P7BQ5xJO89Xz_Uz_rWMIXyf888QlvU2FHatVtFGLzl8";

  const dept = code_insee.substring(0, 2);
  const commune = code_insee.substring(2);

  const query = encodeURIComponent(`SELECT A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
    AA, AB, AC, AD, AE, AF, AG, AH, AI, AJ, AK, AL, AM, AN, AO, AP, AQ, AR, AS, AT, AU, AV, AW, AX, AY, AZ,
    BA, BB, BC, BD, BE, BF, BG, BH, BI, BJ, BK, BL, BM, BN, BO, BP, BQ, BR, BS, BT, BU, BV, BW, BX, \`BY\`, BZ,
    CA, CB, CC, CD, CE, CF, CG, CH, CI, CJ, CK, CL, CM, CN, CO, CP, CQ, CR, CS, CT, CU, CV, CW, CX, CY, CZ,
    DA, DB, DC, DD, DE, DF, DG, DH, DI, DJ, DK, DL, DM, DN, DO, DP, DQ, DR, DS, DT, DU
    WHERE A = '${dept}' AND E = '${commune}'`);

  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&tq=${query}`;
    const response = await axios.get(url);
    const data = response.data;
    const jsonData = JSON.parse(data.substring(47, data.length - 2));


    console.log('legislative', jsonData);
    if (!jsonData.table.rows || jsonData.table.rows.length === 0) {
      return null;
    }

    const row = jsonData.table.rows[0];

    const result = {
      commune: {
        code_departement: row.c[0]?.v,
        libelle_departement: row.c[1]?.v,
        code_circonscription: row.c[2]?.v,
        libelle_circonscription: row.c[3]?.v,
        code_commune: row.c[4]?.v,
        libelle_commune: row.c[5]?.v
      },
      participation: {
        inscrits: row.c[7]?.v,
        abstentions: row.c[8]?.v,
        pourcentage_abstentions: row.c[9]?.v,
        votants: row.c[10]?.v,
        pourcentage_votants: row.c[11]?.v,
        blancs: row.c[12]?.v,
        pourcentage_blancs_inscrits: row.c[13]?.v,
        pourcentage_blancs_votants: row.c[14]?.v,
        nuls: row.c[15]?.v,
        pourcentage_nuls_inscrits: row.c[16]?.v,
        pourcentage_nuls_votants: row.c[17]?.v,
        exprimes: row.c[18]?.v,
        pourcentage_exprimes_inscrits: row.c[19]?.v,
        pourcentage_exprimes_votants: row.c[20]?.v
      },
      candidats: []
    };

    // Dynamically parse candidates
    // Each candidate has 8 columns in sequence:
    // N°Panneau, Sexe, Nom, Prénom, Nuance, Voix, % Voix/Ins, % Voix/Exp
    let currentColumn = 21; // Start after participation data
    const columnsPerCandidate = 8;

    while (currentColumn < row.c.length && row.c[currentColumn + 2]?.v) {
      const candidat = {
        numero_panneau: row.c[currentColumn]?.v,
        sexe: row.c[currentColumn + 1]?.v,
        nom: row.c[currentColumn + 2]?.v,
        prenom: row.c[currentColumn + 3]?.v,
        nuance: row.c[currentColumn + 4]?.v,
        voix: row.c[currentColumn + 5]?.v,
        pourcentage_voix_inscrits: row.c[currentColumn + 6]?.v,
        pourcentage_voix_exprimes: row.c[currentColumn + 7]?.v
      };

      // Only add if we have the essential data (nom and voix)
      if (candidat.nom && candidat.voix !== undefined) {
        result.candidats.push(candidat);
      }

      currentColumn += columnsPerCandidate;
    }

    // Sort candidates by votes (descending)
    result.candidats.sort((a, b) => (b.voix || 0) - (a.voix || 0));

    return result;
  } catch (error) {
    console.error('Error fetching legislative results:', error);
    return null;
  }
};

export const getPresidentElectionResults = async (code_insee) => {
  const sheetID = "1x2HAADOfAg_Yx4TtHfrcTBe070E5W-iVpUi2oJV5FUQ";

  const dept = code_insee.substring(0, 2);
  const commune = code_insee.substring(2);

  // Update query to include all columns A to CY
  const query = encodeURIComponent(
    `SELECT A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
    AA, AB, AC, AD, AE, AF, AG, AH, AI, AJ, AK, AL, AM, AN, AO, AP, AQ, AR, AS, AT, AU, AV, AW, AX, AY, AZ,
    BA, BB, BC, BD, BE, BF, BG, BH, BI, BJ, BK, BL, BM, BN, BO, BP, BQ, BR, BS, BT, BU, BV, BW, BX,\`BY\`, BZ,
    CA, CB, CC, CD, CE, CF, CG, CH, CI, CJ, CK, CL, CM, CN, CO, CP, CQ, CR, CS, CT, CU, CV, CW, CX, CY 
    WHERE A = '${dept}' AND C = '${commune}'`
  );

  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&tq=${query}`;
    const response = await axios.get(url);
    const data = response.data;
    const jsonData = JSON.parse(data.substring(47, data.length - 2));

    console.log('president', jsonData);


    // Process the results
    if (jsonData.table.rows.length > 0) {
      const row = jsonData.table.rows[0];
      return {
        commune: {
          code_departement: row.c[0]?.v,
          libelle_departement: row.c[1]?.v,
          code_commune: row.c[2]?.v,
          libelle_commune: row.c[3]?.v
        },
        participation: {
          inscrits: row.c[5]?.v,
          abstentions: row.c[6]?.v,
          votants: row.c[8]?.v,
          blancs: row.c[10]?.v,
          nuls: row.c[13]?.v,
          exprimes: row.c[16]?.v
        },
        candidats: [
          {
            nom: "ARTHAUD",
            prenom: "Nathalie",
            voix: row.c[23]?.v,
            pourcentage: row.c[25]?.v
          },
          {
            nom: "ROUSSEL",
            prenom: "Fabien",
            voix: row.c[30]?.v,
            pourcentage: row.c[32]?.v
          },
          {
            nom: "MACRON",
            prenom: "Emmanuel",
            voix: row.c[37]?.v,
            pourcentage: row.c[39]?.v
          },
          {
            nom: "LASSALLE",
            prenom: "Jean",
            voix: row.c[44]?.v,
            pourcentage: row.c[46]?.v
          },
          {
            nom: "LE PEN",
            prenom: "Marine",
            voix: row.c[51]?.v,
            pourcentage: row.c[53]?.v
          },
          {
            nom: "ZEMMOUR",
            prenom: "Eric",
            voix: row.c[58]?.v,
            pourcentage: row.c[60]?.v
          },
          {
            nom: "MELENCHON",
            prenom: "Jean-Luc",
            voix: row.c[65]?.v,
            pourcentage: row.c[67]?.v
          },
          {
            nom: "HIDALGO",
            prenom: "Anne",
            voix: row.c[72]?.v,
            pourcentage: row.c[74]?.v
          },
          {
            nom: "JADOT",
            prenom: "Yannick",
            voix: row.c[79]?.v,
            pourcentage: row.c[81]?.v
          },
          {
            nom: "PÉCRESSE",
            prenom: "Valérie",
            voix: row.c[86]?.v,
            pourcentage: row.c[88]?.v
          },
          {
            nom: "POUTOU",
            prenom: "Philippe",
            voix: row.c[93]?.v,
            pourcentage: row.c[95]?.v
          },
          {
            nom: "DUPONT-AIGNAN",
            prenom: "Nicolas",
            voix: row.c[100]?.v,
            pourcentage: row.c[102]?.v
          }
        ]
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching presidential results:', error);
    return null;
  }
};
