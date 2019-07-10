const TIPOVI_PREGLEDA = {
    KRVNI_PRITISAK: "KRVNI_PRITISAK",
    NIVO_SECERA_U_KRVI: "NIVO_SECERA_U_KRVI",
    NIVO_HOLESTEROLA_U_KRVI: "NIVO_HOLESTEROLA_U_KRVI"
}

const ACTIONS = {
    CREATE_PATIENT: "CREATE_PATIENT",
    CREATE_DOCTOR: "CREATE_DOCTOR",
    CHOOSE_DOCTOR: "CHOOSE_DOCTOR",
    LAB_EXAM: "LAB_EXAM"
}

class Doktor {
    constructor (ime, prezime, specijalnost) {
        this.ime = ime;
        this.prezime = prezime;
        this.specijalnost = specijalnost;
        this.pacijenti = [];
        logAction(ACTIONS.CREATE_DOCTOR, this);
    }

    dodajPacijenta (pacijent) {
        this.pacijenti.push(pacijent);
    }

    zakaziLaboratorijskiPregled (datum, vreme, pacijent, tipPregleda, vremePoslednjegObroka = '') {
        switch(tipPregleda) {
            case "KRVNI_PRITISAK":
                pacijent.dodajPregled(new KrvniPritisak(datum, vreme, pacijent, this));
                break;
            case "NIVO_SECERA_U_KRVI":
                pacijent.dodajPregled(new NivoSeceraUKrvi(datum, vreme, pacijent, this, vremePoslednjegObroka));
                break;
            case "NIVO_HOLESTEROLA_U_KRVI":
                pacijent.dodajPregled(new NivoHolesterolaUKrvi(datum, vreme, pacijent, this, vremePoslednjegObroka));
                break;
        }
    }
}

class Pacijent {
    constructor (ime, prezime, jmbg, brojKartona) {
        this.ime = ime;
        this.prezime = prezime;
        this.jmbg = jmbg;
        this.brojKartona = brojKartona;
        this.doktor = null;
        this.pregledi = [];
        logAction(ACTIONS.CREATE_PATIENT, this);
    }

    set izaberiLekara (doktor) {
        this.doktor = doktor;
        doktor.dodajPacijenta(this);
        logAction(ACTIONS.CHOOSE_DOCTOR, this, doktor);
    }

    dodajPregled (pregled) {
        this.pregledi.push(pregled);
    }

    obaviPregled (pregled) {
        pregled.obaviPregled();
        pregled.simulateResults();
        logAction(ACTIONS.LAB_EXAM, pregled);
    }
}

class LaboratorijskiPregled {
    constructor (datum, vreme, pacijent, doktor) {
        this.datum = datum;
        this.vreme = vreme;
        this.pacijent = pacijent;
        this.doktor = doktor;
        this.obavljen = false;
    }

    obaviPregled () {
        this.obavljen = true;
    }
}

class KrvniPritisak extends LaboratorijskiPregled {
    constructor (datum, vreme, pacijent, doktor) {
        super(datum, vreme, pacijent, doktor);
        this.gornji = 0;
        this.donji = 0;
        this.puls = 0;
    }

    simulateResults () {
        this.gornji = randomInInterval(80, 160);
        this.donji = randomInInterval(40, 120);
        this.puls = randomInInterval(0, 150);
    }
    
    getResults () {
        return `Gornji: ${this.gornji}, Donji: ${this.donji}, Puls: ${this.puls}`;
    }

    toString () {
        return `${this.pacijent.ime} je obavio merenje krvnog pritiska.`;
    }
}

class NivoSeceraUKrvi extends LaboratorijskiPregled {
    constructor (datum, vreme, pacijent, doktor, vremePoslednjegObroka) {
        super(datum, vreme, pacijent, doktor);
        this.vrednost = 0;
        this.vremePoslednjegObroka = vremePoslednjegObroka;
    }

    simulateResults () {
        this.vrednost = randomInInterval(1, 10);
    }

    getResults () {
        return `Nivo secera: ${this.vrednost}`;
    }

    toString () {
        return `${this.pacijent.ime} je obavio merenje nivoa secera u krvi.`;
    }
}

class NivoHolesterolaUKrvi extends LaboratorijskiPregled {
    constructor (datum, vreme, pacijent, doktor, vremePoslednjegObroka) {
        super(datum, vreme, pacijent, doktor);
        this.vrednost = 0;
        this.vremePoslednjegObroka = vremePoslednjegObroka;
    }

    simulateResults () {
        this.vrednost = randomInInterval(1, 10);
    }

    getResults () {
        return `Nivo holesterola: ${this.vrednost}`;
    }

    toString () {
        return `${this.pacijent.ime} je obavio merenje nivoa holesterola u krvi.`
    }
}

const logAction = (action, ...params) => {
    
    switch(action) {
        case "CREATE_PATIENT": {
            const [pacijent] = params;
            console.log(`[${currentDateTime()}] Kreiran pacijent ${pacijent.ime}`);
            break;
        }
        case "CREATE_DOCTOR": {
            const [doktor] = params;
            console.log(`[${currentDateTime()}] Kreiran doktor ${doktor.ime}`);
            break;
        }
        case "CHOOSE_DOCTOR": {
            const [pacijent, doktor] = params;
            console.log(`[${currentDateTime()}] Pacijent ${pacijent.ime} izabrao doktora ${doktor.ime}`);
            break;
        }
        case "LAB_EXAM": {
            const [labPregled] = params;
            console.log(`[${currentDateTime()} Pacijent ${labPregled.toString()}]`);
            console.log(labPregled.getResults());
            break;
        }
    }
}

const dateTimeFormat = (dateTime) => {
    const date = `${dateTime.getDate()}.${dateTime.getMonth() + 1}.${dateTime.getFullYear()}`;
    const time = `${dateTime.getHours()}:${dateTime.getMinutes()}`;

    return { date, time };
}

const currentDateTime = () => {
    const dateTime = new Date();
    const { date, time } = dateTimeFormat(dateTime);

    return date + ' ' + time;
}

const randomInInterval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

let lekar = new Doktor("Milan", "", "Nutricionista");
let pacijent = new Pacijent("Dragan", "", "1912993199922", "25555");
pacijent.izaberiLekara = lekar;
lekar.zakaziLaboratorijskiPregled("12.12.2019", "10:30", pacijent, TIPOVI_PREGLEDA.NIVO_SECERA_U_KRVI, "13");
lekar.zakaziLaboratorijskiPregled("11.11.2020", "08:00", pacijent, TIPOVI_PREGLEDA.KRVNI_PRITISAK);
pacijent.obaviPregled(pacijent.pregledi[0]);
pacijent.obaviPregled(pacijent.pregledi[1]);
