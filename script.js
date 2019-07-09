const tipPregleda = {
    KRVNI_PRITISAK: "KRVNI_PRITISAK",
    NIVO_SECERA_U_KRVI: "NIVO_SECERA_U_KRVI",
    NIVO_HOLESTEROLA_U_KRVI: "NIVO_HOLESTEROLA_U_KRVI"
}

const action = {
    CREATE_PATIENT: "CREATE_PATIENT",
    CREATE_DOCTOR: "CREATE_DOCTOR",
    CHOOSE_DOCTOR: "CHOOSE_DOCTOR",
    LAB_EXAM: "LAB_EXAM"
}

class Doktor {
    constructor(ime, prezime, specijalnost) {
        this.ime = ime;
        this.prezime = prezime;
        this.specijalnost = specijalnost;
        this.pacijenti = [];
        logAction(action.CREATE_DOCTOR, this)
    }

    set dodajPacijenta(pacijent) {
        this.pacijenti.push(pacijent);
    }

    zakaziLaboratorijskiPregled (datum, vreme, pacijent, tipPregleda, vremePoslednjegObroka = '') {
        switch(tipPregleda) {
            case "KRVNI_PRITISAK":
                pacijent.dodajPregled =
                    new KrvniPritisak(datum, vreme, pacijent, this)
                    break;
            case "NIVO_SECERA_U_KRVI":
                pacijent.dodajPregled = 
                    new NivoSeceraUKrvi(datum, vreme, pacijent, this, vremePoslednjegObroka)
                    break;
            case "NIVO_HOLESTEROLA_U_KRVI":
                pacijent.dodajPregled = 
                    new NivoHolesterolaUKrvi(datum, vreme, pacijent, this, vremePoslednjegObroka)
                    break;
        }
    }
}

class Pacijent {
    constructor(ime, prezime, jmbg, brojKartona) {
        this.ime = ime;
        this.prezime = prezime;
        this.jmbg = jmbg;
        this.brojKartona = brojKartona;
        this.doktor = null;
        this.pregledi = [];
        logAction(action.CREATE_PATIENT, this)
    }

    set izaberiLekara(doktor) {
        this.doktor = doktor;
        doktor.dodajPacijenta = this;
        logAction(action.CHOOSE_DOCTOR, this, doktor)
    }

    set dodajPregled(pregled) {
        this.pregledi.push(pregled);
    }
}

class LaboratorijskiPregled {
    constructor(datum, vreme, pacijent, doktor){
        this.datum = datum;
        this.vreme = vreme;
        this.pacijent = pacijent;
        this.doktor = doktor;
        this.obavljen = false;
    }

    obaviPregled() {
        this.obavljen = true;
        this.simulateResults();
        logAction(action.LAB_EXAM, this)
    }
}

class KrvniPritisak extends LaboratorijskiPregled {
    constructor(datum, vreme, pacijent, doktor) {
        super(datum, vreme, pacijent, doktor);
        this.gornji = 0;
        this.donji = 0;
        this.puls = 0;
    }

    simulateResults() {
        this.gornji = randomInInterval(80, 160);
        this.donji = randomInInterval(40, 120);
        this.puls = randomInInterval(0, 150);
    }
    
    get getResults() {
        return {
            gornji: this.gornji,
            donji: this.donji,
            puls: this.puls
        }
    }
}

class NivoSeceraUKrvi extends LaboratorijskiPregled {
    constructor(datum, vreme, pacijent, doktor, vremePoslednjegObroka) {
        super(datum, vreme, pacijent, doktor);
        this.vrednost = 0;
        this.vremePoslednjegObroka = vremePoslednjegObroka;
    }

    simulateResults() {
        this.vrednost = randomInInterval(1,10);
    }

    get getResults() {
        return this.vrednost;
    }
}

class NivoHolesterolaUKrvi extends LaboratorijskiPregled {
    constructor(datum, vreme, pacijent, doktor, vremePoslednjegObroka) {
        super(datum, vreme, pacijent, doktor);
        this.vrednost = 0;
        this.vremePoslednjegObroka = vremePoslednjegObroka;
    }

    simulateResults() {
        this.vrednost = randomInInterval(1, 10);
    }

    get getResults() {
        return this.vrednost;
    }
}

const logAction = (action, ...params) => {
    const dateTime = new Date();
    const { date, time } = dateTimeFormat(dateTime);
    
    switch(action) {
        case "CREATE_PATIENT": {
            const [pacijent] = params;
            console.log(`[${date} ${time}] Kreiran pacijent ${pacijent.ime}`);
            break;
        }
        case "CREATE_DOCTOR": {
            const [doktor] = params;
            console.log(`[${date} ${time}] Kreiran doktor ${doktor.ime}`);
            break;
        }
        case "CHOOSE_DOCTOR": {
            const [pacijent, doktor] = params;
            console.log(`[${date} ${time}] Pacijent ${pacijent.ime} izabrao doktora ${doktor.ime}`);
            break;
        }
        case "LAB_EXAM": {
            const [labPregled] = params;
            if(labPregled instanceof KrvniPritisak){
                console.log(`[${date} ${time}] Pacijent ${labPregled.pacijent.ime} 
                                                    je obavio merenje krvnog pritiska.`);
                
                console.log(`Gornji ${labPregled.getResults.gornji}`);
                console.log(`Donji ${labPregled.getResults.donji}`);
                console.log(`Puls ${labPregled.getResults.puls}`);
            }else if(labPregled instanceof NivoSeceraUKrvi){
                console.log(`[${date} ${time}] Pacijent ${labPregled.pacijent.ime} je obavio merenje nivoa secera u krvi"`);

                console.log(`Nivo secera: ${labPregled.getResults}`)
            }else{
                console.log(`[${date} ${time}] Pacijent ${labPregled.pacijent.ime} je obavio merenje nivoa holesterola u krvi"`);

                console.log(`Nivo holesterola: ${labPregled.getResults}`)
            }
        }
    }
}

const dateTimeFormat = (dateTime) => {
    const month = dateTime.getMonth() + 1;
    const date = dateTime.getDate() + "." + month + "." + dateTime.getFullYear();
    const time = dateTime.getHours() + ":" + dateTime.getMinutes();

    return { date: date, time: time };
}

const randomInInterval = (min, max) => Math.floor(Math.random()*(max-min+1)+min);

let lekar = new Doktor("Milan", "", "Nutricionista");
let pacijent = new Pacijent("Dragan", "", "1912993199922", "25555");
pacijent.izaberiLekara = lekar;
lekar.zakaziLaboratorijskiPregled("12.12.2019", "10:30", pacijent, tipPregleda.NIVO_SECERA_U_KRVI, "13");
lekar.zakaziLaboratorijskiPregled("11.11.2020", "08:00", pacijent, tipPregleda.KRVNI_PRITISAK);
pacijent.pregledi[0].obaviPregled();
pacijent.pregledi[1].obaviPregled();
