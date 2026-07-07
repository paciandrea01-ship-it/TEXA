import React, { useState, useMemo, useEffect, useRef } from "react";

/* ============================================================
   TEXA — Textile Network & Marketplace · v3
   ------------------------------------------------------------
   Design: bianco / nero / verde. Minimale ed elegante, Inter +
   accenti serif corsivi, molto spazio bianco, mappa reale
   (Leaflet + OSM) con fallback SVG se le tile non caricano.

   v3: pagina Ricerca con Trend Colori stagionali, Fiere
   internazionali (calendario + stato live + prenotazione),
   Messaggistica fornitori (chat, profilo, certificazioni,
   documenti) e cartella colori Pantone-style per ogni azienda.

   DATI: 73 fornitori reali importati da LISTA.xlsx

   SCHEMA DATI (pronto per backend / app mobile)
   Company  { id, name, category, speciality, description, tags[],
              certifications[], country, city, province, address,
              contactPerson, website, emails[], phone, lat, lng }
   RFQ      { id, companyId, product, quantity, message,
              contactName, contactEmail, createdAt, status }
   Fair     { id, name, city, country, venue, start, end, focus,
              desc, url }
   Thread   { companyId, msgs[{ id, from:"me"|"sup", text, at }] }
   Shade    { n:nome, p:riferimento Pantone TCX più vicino, h:hex }

   AI-READY: interpretQuery(q) → { category, materials[], keywords[] }
   Oggi keyword matching, domani stessa firma con chiamata API.
   LIVE-READY: getTrends() e fairStatus() si calcolano sulla data
   corrente; TRENDS_ENDPOINT consente di collegare una fonte online
   (stessa firma) per l'aggiornamento automatico dei trend colore.
   ============================================================ */

const COMPANIES = [{"id":"cdc10798b","name":"PLASTI-MAX SPA","category":"Packaging & Display","speciality":"APPENDINI","description":"GANCI , APPENDINI , ANTITACCHEGGI","tags":["GANCI","APPENDINI","ANTITACCHEGGI"],"certifications":[],"country":"ITALIA","city":"Grumello Del Monte","province":"BG","address":"VIA GIUSEPPE MICCA, 68","contactPerson":"","website":"https://www.plastimax.com","emails":["info@plastimax.com"],"phone":"035 830340","lat":45.633,"lng":9.879},{"id":"cbf82d286","name":"CALZIFICIO BIASCO","category":"Calze & Calzetteria","speciality":"CALZE","description":"CALZE SPORT TECNICHE , DA LAVORO, Restringimento Graduale","tags":["CALZE SPORT TECNICHE","DA LAVORO","Restringimento Graduale"],"certifications":[],"country":"ITALIA","city":"San Dana","province":"LE","address":"Via A. Meucci, 9","contactPerson":"","website":"https://www.calzificiobiasco.it/it","emails":["lauralavanderie@gmail.com","info@calzificiobiasco.it"],"phone":"0833 523882","lat":39.916,"lng":18.316},{"id":"c57048087","name":"BUSI GIOVANNI s.r.l.","category":"Macchinari","speciality":"Macchine","description":"Macchine per calzetteria","tags":["Macchine per calzetteria"],"certifications":[],"country":"ITALIA","city":"Botticino Sera","province":"BS","address":"Via Giovanni Busi, 14","contactPerson":"","website":"https://www.busigiovanni.com/it","emails":["busi@busigiovanni.com"],"phone":"030 2190304","lat":45.542,"lng":10.307},{"id":"c53179ace","name":"GRUPPO ALLPACK","category":"Packaging & Display","speciality":"ESPOSITORI","description":"CROWNER , ESPOSITORI IN CARTONE","tags":["CROWNER","ESPOSITORI IN CARTONE"],"certifications":[],"country":"ITALIA","city":"Suzzara","province":"MN","address":"Via Lenin, 37/B","contactPerson":"","website":"https://www.allpack.it","emails":["c.andrea@allpack.it"],"phone":"340/2149552 0376/535612","lat":44.992,"lng":10.745},{"id":"cdd89c90b","name":"CARTIMBALLO SPA","category":"Packaging & Display","speciality":"ESPOSITORI","description":"CROWNER , ESPOSITORI IN CARTONE","tags":["CROWNER","ESPOSITORI IN CARTONE"],"certifications":[],"country":"ITALIA","city":"Falzé Di Piave","province":"TV","address":"Via I° Maggio, 30","contactPerson":"","website":"https://www.cartimballo.it","emails":["martina.gorgato@cartimballospa.it"],"phone":"0434-632363","lat":45.855,"lng":12.17},{"id":"cb6ed0bb9","name":"FILOPROGETTI srl","category":"Packaging & Display","speciality":"ESPOSITORI","description":"ESPOSITORI E GANCI IN METALLO","tags":["ESPOSITORI E GANCI IN METALLO"],"certifications":[],"country":"ITALIA","city":"Reggio Emilia","province":"RE","address":"Via Emidio Villa 13/A","contactPerson":"","website":"https://www.filoprogetti.it","emails":["Ordini@filoprogettisrl.it"],"phone":"0522/1713128","lat":44.698,"lng":10.63},{"id":"c4c8e9056","name":"Scatolifcio Medicinese S.r.l.","category":"Packaging & Display","speciality":"ESPOSITORI","description":"ESPOSITORI , POZZETTI , SCATOLE FUSTELLATE , SCATOLE","tags":["ESPOSITORI","POZZETTI","SCATOLE FUSTELLATE","SCATOLE"],"certifications":[],"country":"ITALIA","city":"Medicina","province":"BO","address":"via San Vitale ovest 302","contactPerson":"","website":"https://www.scatolificiomedicinese.com","emails":["andrea.tullini@scatolificiomedicinese.com","ordini@scatolificiomedicinese.com"],"phone":"051 851451 051 851423","lat":44.478,"lng":11.638},{"id":"c5714c08b","name":"CONSUL + S.r.l","category":"Packaging & Display","speciality":"OLOGRAMMI","description":"OLOGRAMMI","tags":["OLOGRAMMI"],"certifications":[],"country":"ITALIA","city":"Carpenedolo","province":"BS","address":"Via Enrico Fermi 2","contactPerson":"","website":"https://www.ologrammi.com","emails":["agape.vecchiolini@consulpiu.it"],"phone":"349/6183722 030/7777183","lat":45.363,"lng":10.431},{"id":"c0646ffab","name":"Scatolificio Bresciano SRL","category":"Packaging & Display","speciality":"SCATOLE","description":"SCATOLE","tags":["SCATOLE"],"certifications":[],"country":"ITALIA","city":"Fenili Belasi","province":"BS","address":"Via Trento, 154 - 25020","contactPerson":"","website":"https://www.scatolificiobresciano.it","emails":["brescianord@scatolificiobresciano.it"],"phone":"030 9745169","lat":45.41,"lng":10.1},{"id":"c1bfacbe4","name":"DECOR TEX di Coffinardi S.n.c.","category":"Stampa & Ricamo","speciality":"STAMPA SU CAPI","description":"DIGITALE , SERIGRAFICA , ANTISCIVOLO , SUBLIMATICA , MEDICALE","tags":["DIGITALE","SERIGRAFICA","ANTISCIVOLO","SUBLIMATICA","MEDICALE"],"certifications":[],"country":"ITALIA","city":"Bagnolo Mella","province":"BS","address":"Via G. Piamarta 48/50","contactPerson":"","website":"https://www.decor-tex.it","emails":["info@gruppodecortex.it","info@decor-tex.it"],"phone":"0306821559","lat":45.428,"lng":10.181},{"id":"ca3893632","name":"LITOTIPOGRAF","category":"Packaging & Display","speciality":"TIPOGRAFIA","description":"LITOGRAFIA - STAMPA DIGITALE","tags":["LITOGRAFIA - STAMPA DIGITALE"],"certifications":[],"country":"ITALIA","city":"San Zeno","province":"BS","address":"via G. Galilei, traversa seconda, 35","contactPerson":"","website":"https://litotipograf.wordpress.com","emails":["paolaf@litotipograf.191.it","paolalitotipograf@virgilio.it"],"phone":"0302160195","lat":45.492,"lng":10.216},{"id":"ce0b165fd","name":"GIORGINO Company Srl","category":"Abbigliamento & Intimo","speciality":"UNDERWEAR","description":"INTIMO UOMO , DONNA , BIMBO , PIGIAMI , HOMEWEAR","tags":["INTIMO UOMO","DONNA","BIMBO","PIGIAMI","HOMEWEAR"],"certifications":[],"country":"ITALIA","city":"Andria","province":"BT","address":"Via Barletta, 232/234","contactPerson":"","website":"https://www.giorginocompany.it","emails":["commerciale@giorginocompany.it"],"phone":"0883 556029","lat":41.227,"lng":16.295},{"id":"c0b6cde4a","name":"Calzificio Roby Roby di Busi Roberto","category":"Calze & Calzetteria","speciality":"CALZE","description":"Calze di alta qualità , sportive , spugna selezionata","tags":["Calze di alta qualità","sportive","spugna selezionata"],"certifications":[],"country":"ITALIA","city":"Botticino Sera","province":"BS","address":"Via F. Carini , 50","contactPerson":"","website":"https://www.calzificioroby.it","emails":["info@calzificiorobyroby.it"],"phone":"030 2190591","lat":45.542,"lng":10.307},{"id":"c96ebb0ae","name":"Airily","category":"Stampa & Ricamo","speciality":"STAMPA SU CAPI","description":"Stampe e applicazioni , ricamo","tags":["Stampe e applicazioni","ricamo"],"certifications":[],"country":"ITALIA","city":"Guanzate","province":"CO","address":"Via XXIV Maggio, 12/A","contactPerson":"","website":"https://www.airily.it","emails":["airily@airily.it"],"phone":"031.976515","lat":45.723,"lng":9.011},{"id":"c1d637b45","name":"Loreley","category":"Stampa & Ricamo","speciality":"STAMPA SU CAPI","description":"DIGITALE , SERIGRAFICA , ANTISCIVOLO , SUBLIMATICA , ecc","tags":["DIGITALE","SERIGRAFICA","ANTISCIVOLO","SUBLIMATICA","ecc"],"certifications":[],"country":"ITALIA","city":"Caerano San Marco","province":"TV","address":"Via Vittime del Vajont 5","contactPerson":"","website":"https://loreleysrl.it","emails":["info@loreleysrl.it"],"phone":"0423 569900","lat":45.78,"lng":12.005},{"id":"cf4c177d7","name":"Inprex","category":"Stampa & Ricamo","speciality":"STAMPA SU CAPI","description":"Componenti per calzature e abbigliamento","tags":["Componenti per calzature e abbigliamento"],"certifications":[],"country":"ITALIA","city":"Altivole","province":"TV","address":"Via della Botte, 14 - Altivole","contactPerson":"","website":"https://loreleysrl.it","emails":["info@inprex.it"],"phone":"0423 601211","lat":45.755,"lng":11.963},{"id":"cea52cb04","name":"Calzificio Dany","category":"Calze & Calzetteria","speciality":"CALZE","description":"produce calze tecniche sport","tags":["produce calze tecniche sport"],"certifications":[],"country":"ITALIA","city":"Bagnolo Mella","province":"BS","address":"Via Padre Giovanni Piamarta, 6/8, 25021","contactPerson":"","website":"https://www.calzificiodany.it","emails":["info@calzificiodany.it"],"phone":"030 6822209","lat":45.428,"lng":10.181},{"id":"c04751149","name":"Calzificio Bellafonte srl","category":"Calze & Calzetteria","speciality":"UNDERWEAR","description":"Hosiery & Seamless Underwear ( Leggings )","tags":["Hosiery & Seamless Underwear ( Leggings )"],"certifications":[],"country":"ITALIA","city":"Castel Goffredo","province":"MN","address":"Strada Pedagnolo 3/B","contactPerson":"","website":"https://www.bellafonte.com","emails":["info@bellafonte.com"],"phone":"0376 770369","lat":45.298,"lng":10.475},{"id":"cebfe276e","name":"Manifatture Ennevi di Vitale Onofrio","category":"Abbigliamento & Intimo","speciality":"UNDERWEAR","description":"INTIMO UOMO , DONNA , BIMBO","tags":["INTIMO UOMO","DONNA","BIMBO"],"certifications":[],"country":"ITALIA","city":"Andria","province":"BT","address":"S.P. Andria-Trani Km. 2,700","contactPerson":"","website":"https://www.manifatturennevi.it","emails":["direzione@manifatturennevi.it","amministrazione@manifatturennevi.it","info@manifatturennevi.it"],"phone":"0883.764468","lat":41.227,"lng":16.295},{"id":"c3da8be29","name":"Calzificio Mariani Fabiola","category":"Calze & Calzetteria","speciality":"CALZE","description":"Calzetteria, Calzificio, Calze Uomo, Calze Donna,","tags":["Calzetteria","Calzificio","Calze Uomo","Calze Donna"],"certifications":[],"country":"ITALIA","city":"Melissano","province":"LE","address":"Via G. Rossini, 98, 73040 Melissano LE","contactPerson":"","website":"","emails":["info@calzificiomariani.com"],"phone":"0833 587470","lat":39.973,"lng":18.123},{"id":"cde8a4bf8","name":"Confezioni Chapru srl","category":"Confezioni & Servizi","speciality":"Confezioni","description":"Confezioni Calze e intimo , stiro , e packaging","tags":["Confezioni Calze e intimo","stiro","e packaging"],"certifications":[],"country":"ITALIA","city":"Quinzano D'Oglio","province":"BS","address":"Via Benigno Zaccagnini,5/7","contactPerson":"","website":"","emails":["banay19@gmail.com"],"phone":"3282252573 - 3911498934","lat":45.312,"lng":10.006},{"id":"c04ed7439","name":"Confezione Calze di Lin Chunguang","category":"Confezioni & Servizi","speciality":"Confezioni","description":"Confezioni Calze , packaging","tags":["Confezioni Calze","packaging"],"certifications":[],"country":"ITALIA","city":"Casaloldo","province":"MN","address":"via Gramsci, 9","contactPerson":"","website":"","emails":[],"phone":"3335931286","lat":45.254,"lng":10.474},{"id":"c72901ffe","name":"Rotobel S.n.c.","category":"Packaging & Display","speciality":"Scotch","description":"Nastro adesivo","tags":["Nastro adesivo"],"certifications":[],"country":"ITALIA","city":"S.Martino Buon Albergo","province":"VR","address":"Via Marconi, 4","contactPerson":"","website":"https://www.rotobel.it/it-it/p/56/azienda","emails":["giovanni.colotti@libero.it","giorgia@rotobel.it"],"phone":"045.994436 - 045.994677","lat":45.421,"lng":11.093},{"id":"c27bce996","name":"Artemisia Srl","category":"Abbigliamento & Intimo","speciality":"Abbigliamento","description":"Underwear , Sportwear, Fashionwear","tags":["Underwear","Sportwear","Fashionwear"],"certifications":[],"country":"ITALIA","city":"Castel Goffredo","province":"MN","address":"Via Acquafredda, 14 L/K","contactPerson":"","website":"https://intimoartemisia.com","emails":["info@intimoartemisia.com"],"phone":"0376 771963","lat":45.298,"lng":10.475},{"id":"cd0ebc0aa","name":"CONFEZIONI LUSSO","category":"Calze & Calzetteria","speciality":"calzetteria e seamless","description":"Calze , collant , Underwear , Sportwear","tags":["Calze","collant","Underwear","Sportwear"],"certifications":[],"country":"ITALIA","city":"Castiglione Delle Stiviere","province":"MN","address":"Via Galvani 20","contactPerson":"","website":"https://www.confezionilusso.it/contact","emails":["confezioni.lusso@virgilio.it"],"phone":"0376 672073","lat":45.389,"lng":10.489},{"id":"cf355262a","name":"L.P. di Lazzari I. Pasini M. e figli s.n.c.","category":"Calze & Calzetteria","speciality":"CALZE MODA FANTASIA","description":"calze da uomo e donna in doppio e monocilindro in cotone, lana, misti cashmere, seta e altre lane pregiate, nella finezze 3 / 5 / 6 / e 8.","tags":["calze da uomo e donna in doppio e monocilindro in cotone","lana","misti cashmere","seta e altre lane pregiate","nella finezze 3 / 5 / 6 / e 8."],"certifications":[],"country":"ITALIA","city":"Vallio Terme","province":"BS","address":"Via dei Campi, 5","contactPerson":"","website":"https://lppasini.it","emails":["info@lppasini.it"],"phone":"0365 370025","lat":45.606,"lng":10.399},{"id":"c646c0d68","name":"Calzificio Pedaci","category":"Calze & Calzetteria","speciality":"CALZE SPORT","description":"calze sportive,calze sci,calze da calcio","tags":["calze sportive","calze sci","calze da calcio"],"certifications":[],"country":"ITALIA","city":"Acquarica Del Capo","province":"LE","address":"Via Pedaci, 37","contactPerson":"","website":"https://www.pedaci.com/calze","emails":["antoniopedaci@pedaci.com"],"phone":"0833 721479 - 0833 722550","lat":39.913,"lng":18.243},{"id":"c4c08454d","name":"Ciesse Casuals Abbigliamento srl (Shelsham trading Representative Italy office)","category":"Abbigliamento & Intimo","speciality":"Abbigliamento Sport","description":"menswear, womenswear and childrenswear in both woven and knits.","tags":["menswear","womenswear and childrenswear in both woven and knits."],"certifications":[],"country":"ITALIA","city":"Prato","province":"PO","address":"Via Valentini 13, 59100 Prato - Italy","contactPerson":"","website":"https://www.ciessecasuals.it/index.html","emails":["cerbai@ciessecasuals.it"],"phone":"0574 - 96.43.50","lat":43.879,"lng":11.097},{"id":"c5b98b087","name":"FILMAR","category":"Filati","speciality":"FILATI COTONIERI","description":"COTONE , FILOSCOZIA , MISCHIE","tags":["COTONE","FILOSCOZIA","MISCHIE"],"certifications":[],"country":"ITALIA","city":"Zocco","province":"BS","address":"Via A. De Gasperi 65 - 25030","contactPerson":"","website":"https://www.filmar.it","emails":[],"phone":"030 776700","lat":45.581,"lng":9.955},{"id":"cd65f853b","name":"SINA FILATI FASHION YARN s.r.l.","category":"Filati","speciality":"FILATI FASHION","description":"COTONE, FANTASIA , NYLON , TECNICI , ECC","tags":["COTONE","FANTASIA","NYLON","TECNICI","ECC"],"certifications":[],"country":"ITALIA","city":"Castiglione D. Stiviere","province":"MN","address":"Via A. Volta, 29 - 46043","contactPerson":"","website":"https://www.sinafilati.com/index.html","emails":[],"phone":"0376 1888328","lat":45.389,"lng":10.489},{"id":"cee5a3d8b","name":"CREAFIL INTERNATIONAL SRL","category":"Filati","speciality":"FILATI FASHION","description":"Chenille yarns","tags":["Chenille yarns"],"certifications":[],"country":"ITALIA","city":"Montale","province":"PT","address":"Via Guido Rossa 45/G - 51037","contactPerson":"","website":"https://www.creafilinternational.it","emails":[],"phone":"0573 558237","lat":43.934,"lng":11.02},{"id":"c8f67755c","name":"ALPES MANIFATTURA ILATI S.p.A.","category":"Filati","speciality":"FILATI FASHION","description":"Lanieri , acrillico , cotoni","tags":["Lanieri","acrillico","cotoni"],"certifications":[],"country":"ITALIA","city":"Rossano Veneto","province":"VI","address":"Via Salute, 52 - 36028","contactPerson":"","website":"https://www.alpesfilati.com","emails":["alpes@alpesfilati.com"],"phone":"0424/54420","lat":45.703,"lng":11.799},{"id":"cc2f44a03","name":"COFIL","category":"Filati","speciality":"FILATI FASHION","description":"acrillico , lane , cotoni","tags":["acrillico","lane","cotoni"],"certifications":[],"country":"ITALIA","city":"Montemurlo","province":"PO","address":"Via dell’Artigianato, 5/7/9 - 59013","contactPerson":"","website":"https://www.filaticofil.com","emails":[],"phone":"0574 650704","lat":43.926,"lng":11.037},{"id":"c6fd517e2","name":"Ilaria Manifatture Lane S.r.l.","category":"Filati","speciality":"FILATI LANIERI","description":"LANE , MOHAIR (RMS) , FASHION GENERALE","tags":["LANE","MOHAIR (RMS)","FASHION GENERALE"],"certifications":["RMS"],"country":"ITALIA","city":"Calenzano","province":"FI","address":"Via Paganelle - 50041","contactPerson":"","website":"https://www.ilaria.it/it","emails":[],"phone":"055-8876693","lat":43.865,"lng":11.165},{"id":"cccafb11b","name":"AZETA FILATI","category":"Filati","speciality":"FILATI LANIERI","description":"LANE , MOHAIR, BABY CAMMELLO , ALPACA , ECC","tags":["LANE","MOHAIR","BABY CAMMELLO","ALPACA","ECC"],"certifications":[],"country":"ITALIA","city":"Vaiano","province":"PO","address":"via F.lli Buricchi, 15","contactPerson":"","website":"https://www.azetafilati.it/contatti","emails":[],"phone":"0574 988902","lat":43.966,"lng":11.121},{"id":"c2ab24e84","name":"LANIFICIO DELL'OLIVO","category":"Filati","speciality":"FILATI LANIERI","description":"LANE , MOHAIR, Lyocell , ALPACA , ECC","tags":["LANE","MOHAIR","Lyocell","ALPACA","ECC"],"certifications":[],"country":"ITALIA","city":"Campi Bisenzio","province":"FI","address":"Via Fratelli Cervi, 84","contactPerson":"","website":"https://lanificiodellolivo.com/it","emails":[],"phone":"055 898641","lat":43.826,"lng":11.129},{"id":"c0a6d8a40","name":"DAVIFIL","category":"Filati","speciality":"FILATI NATURALI","description":"lino, canapa, juta, il cotone o l’ortica , lana","tags":["lino","canapa","juta","il cotone o l’ortica","lana"],"certifications":[],"country":"ITALIA","city":"Benna","province":"BI","address":"Via Nazario Sauro, 43 - 13871","contactPerson":"","website":"https://www.davifil.it/contatti","emails":[],"phone":"015 2558198","lat":45.514,"lng":8.126},{"id":"cb9528935","name":"EUROLAST s.rl.","category":"Filati","speciality":"FILATI SINTETICI E NATURALI","description":"DRYARN , BORGOLON , MICROLON , CREORA , Lanieri","tags":["DRYARN","BORGOLON","MICROLON","CREORA","Lanieri"],"certifications":[],"country":"ITALIA","city":"Castel Goffredo","province":"MN","address":"Via Svezia, 10","contactPerson":"","website":"https://www.eurolast.it","emails":["sergio.pinotti@eurolast.it"],"phone":"0376 771002","lat":45.298,"lng":10.475},{"id":"c0be7a393","name":"INDUSTRIA ITALIANA FILATI","category":"Filati","speciality":"FILATI FANTASIA","description":"Laniere , cotoni , nylon , seta , ecc","tags":["Laniere","cotoni","nylon","seta","ecc"],"certifications":[],"country":"ITALIA","city":"Prato","province":"PO","address":"Via del Ferro, 137 - 59100","contactPerson":"","website":"https://industriaitalianafilati.it","emails":[],"phone":"0574 64631","lat":43.879,"lng":11.097},{"id":"c9b96885a","name":"Sitip S.p.A.","category":"Filati","speciality":"Filati Tech performance","description":"Filati Tech performance","tags":["Filati Tech performance"],"certifications":[],"country":"ITALIA","city":"Cene","province":"BG","address":"Via Vall’Alta, 13","contactPerson":"","website":"https://sitip.it","emails":["info@sitip.it"],"phone":"035 736511","lat":45.78,"lng":9.831},{"id":"c3fa34d00","name":"Penn Solutions S.r.l.","category":"Tessuti","speciality":"TESSUTI TECH SPORTIVI E MEDICALI","description":"Filati riciclati , Tessuto Grip , Tessuti medicali , Sportivi => 3d e con Grip","tags":["Filati riciclati","Tessuto Grip","Tessuti medicali","Sportivi => 3d e con Grip"],"certifications":["GRS"],"country":"ITALIA","city":"Bregnano","province":"CO","address":"Via Resegone N. 1","contactPerson":"","website":"https://www.pennsolutions.eu","emails":["info@pennsolutions.it"],"phone":"031 77 89 28","lat":45.7,"lng":9.011},{"id":"c47626c23","name":"MONTICOLOR","category":"Filati","speciality":"Filati Cotonieri","description":"Filati Cotonieri","tags":["Filati Cotonieri"],"certifications":[],"country":"ITALIA","city":"Montirone","province":"BS","address":"Via Artigianale, 55","contactPerson":"","website":"https://www.monticolor.com","emails":["commerciale@monticolor.com"],"phone":"030 217 8811","lat":45.446,"lng":10.229},{"id":"cf31e648f","name":"INTERFIL TIP","category":"Filati","speciality":"naturali, artificiali e sintetici","description":"Coex , viscosa , Nylon , Riciclati","tags":["Coex","viscosa","Nylon","Riciclati"],"certifications":["GRS"],"country":"ITALIA","city":"Pieve Porto Morone","province":"PV","address":"Via Ponte Vecchio, 11","contactPerson":"Claudio","website":"https://interfiltp.it","emails":["claudio.malinverno@interfiltp.it"],"phone":"031 88 92 111","lat":45.096,"lng":9.442},{"id":"c78d5c38f","name":"Torcitura Padana Spa","category":"Filati","speciality":"Filati Sintetici e Naturali , Tech","description":"Coex , GRS riciclati , Nylon","tags":["Coex","GRS riciclati","Nylon"],"certifications":["GRS"],"country":"ITALIA","city":"Pieve Porto Morone","province":"PV","address":"Via Ponte Vecchio, 11","contactPerson":"","website":"https://www.torciturapadana.it","emails":[],"phone":"0382 78 035","lat":45.096,"lng":9.442},{"id":"ca2cd5813","name":"SIRMAX / ISOFIL","category":"Filati","speciality":"Filati Sintetici","description":"Polipropilene , poliestere , cotonieri ,","tags":["Polipropilene","poliestere","cotonieri"],"certifications":[],"country":"ITALIA","city":"Cittadella","province":"PD","address":"Viale dell'Artigianato, 42, 35013 Cittadella PD","contactPerson":"","website":"https://www.sirmax.com/it","emails":["info@sirmax.com"],"phone":"049 944 1111","lat":45.649,"lng":11.784},{"id":"c8f58e8fc","name":"PPH „LEGS” Sp. z o.o","category":"Filati","speciality":"FILATI SINTETICI E NATURALI","description":"Polipropilene , cotone , bamboo , poliestere , ecc","tags":["Polipropilene","cotone","bamboo","poliestere","ecc"],"certifications":[],"country":"ITALIA/POLONIA","city":"Aleksandrów Łódzki","province":"PL","address":"Zgierska 48/52, 95-070 Aleksandrów Łódzki","contactPerson":"Alberto Mainetti","website":"https://www.legs.com.pl","emails":["a.mainetti@legs.com.pl"],"phone":"3299853962","lat":51.82,"lng":19.303},{"id":"cd0c34bad","name":"Filtrading S.r.l. , Bosifil","category":"Filati","speciality":"FILATI SINTETICI E NATURALI","description":"Bosifil segue la parte di filati discontinui, Subbifil è l’orditura del gruppo mentre Filtrading segue la parte di filati continui","tags":["Bosifil segue la parte di filati discontinui","Subbifil è l’orditura del gruppo mentre Filtrading segue la parte di filati continui"],"certifications":[],"country":"ITALIA","city":"Cazzano S. Andrea","province":"BG","address":"Via Cav. Pietro Radici, 29 - 24026","contactPerson":"Loris Bosio","website":"http://www.filtrading.it","emails":["info@bosifil.it","info@bosiogroup.com","loris@filtrading.it"],"phone":"035 733 827","lat":45.812,"lng":9.887},{"id":"c73217b15","name":"Polipeli S.p.a.","category":"Filati","speciality":"Filati Lanieri","description":"Baby alpaca, mohair, lane , lino , alpaca , camel , ecc","tags":["Baby alpaca","mohair","lane","lino","alpaca","camel","ecc"],"certifications":[],"country":"ITALIA","city":"Prato","province":"PO","address":"Via del Ferro, 374/1","contactPerson":"Francesca","website":"http://www.polipeli.com","emails":["francesca@polipeli.com"],"phone":"574540923","lat":43.879,"lng":11.097},{"id":"c0e9beb09","name":"Casazza - Rappresentanze filati","category":"Filati","speciality":"Filati per l'industria","description":"Agente per Filati","tags":["Agente per Filati"],"certifications":[],"country":"ITALIA","city":"Aicurzio","province":"MB","address":"Via Albareda , 2","contactPerson":"Alvise Casazza","website":"","emails":["sales@casazzafilati.it"],"phone":"3458778080 - 0396800132","lat":45.638,"lng":9.406},{"id":"cd967c6f8","name":"Maglificio Corno snc","category":"Tessuti","speciality":"TESSUTI HIGH TECH","description":"poliestere, poliammide, polipropilene, carbonio e argento anche in mischia con l’elastomero tessuti tecnici per lo sport","tags":["poliestere","poliammide","polipropilene","carbonio e argento anche in mischia con l’elastomero tessuti tecnici per lo sport"],"certifications":[],"country":"ITALIA","city":"Bernareggio","province":"MB","address":"Via dell'Artiginato, 41","contactPerson":"","website":"http://www.corno.eu","emails":[],"phone":"039 680 02 30","lat":45.649,"lng":9.404},{"id":"c8724f85b","name":"Olmetex S.p.a","category":"Tessuti","speciality":"TESSUTI TECNICI E SOSTENIBILI","description":"waterproof, water-repellent , bioltex, econyl , dynema, cordura, hmpe, tpu, carbon, s teel & kevlar","tags":["waterproof","water-repellent","bioltex","econyl","dynema","cordura","hmpe","tpu"],"certifications":["GRS"],"country":"ITALIA","city":"Olmeda Di Capiago","province":"CO","address":"Via Canturina, 10","contactPerson":"/","website":"https://olmetex.it/tessuti","emails":["info@olmetex.it"],"phone":"031 46 302 11","lat":45.771,"lng":9.113},{"id":"c87012948","name":"Borgini Jersey","category":"Tessuti","speciality":"Tessuti Sportivi , Tessuti Mare , Green","description":"Carbon , silver , micromodal , polipropilene , poliestere, ecc..","tags":["Carbon","silver","micromodal","polipropilene","poliestere","ecc.."],"certifications":[],"country":"ITALIA","city":"Cassina Rizzardi","province":"CO","address":"Via alla Selva 596","contactPerson":"Andrea Lucchina","website":"https://borgini.it","emails":["andrew@borgini.it"],"phone":"337 1135285 031/883311","lat":45.75,"lng":9.031},{"id":"ce0bdc3a1","name":"Filatura Papi Fabio S.p.A.","category":"Filati","speciality":"Filati Lanieri","description":"lane , mischie interessanti , merino , cashmere , ecc","tags":["lane","mischie interessanti","merino","cashmere","ecc"],"certifications":[],"country":"ITALIA","city":"Gaggio Montano (Bo)","province":"BO","address":"Via Vivalle, 193","contactPerson":"","website":"https://www.papifabio.com","emails":["francesca.c@papifabio.com","ufficiotecnico@papifabio.com"],"phone":"0534 30206","lat":44.198,"lng":10.936},{"id":"ced82b511","name":"Filpucci S.p.A.","category":"Filati","speciality":"fili per maglieria alta gamma","description":"Lanieri ,seta , cotone , mohair, viscosa","tags":["Lanieri","seta","cotone","mohair","viscosa"],"certifications":[],"country":"ITALIA","city":"Capalle, Campi Bisenzio","province":"FI","address":"Via dei Tigli, 41","contactPerson":"","website":"https://www.filpucci.it","emails":["filpucci@filpucci.it"],"phone":"055 8969382","lat":43.844,"lng":11.14},{"id":"c43fc5eac","name":"Giorgini Silvano Filati","category":"Filati","speciality":"Filati ciniglia, filati fantasia","description":"Filati ciniglia, filati fantasia","tags":["Filati ciniglia","filati fantasia"],"certifications":[],"country":"ITALIA","city":"Quarrata","province":"PT","address":"Via Bologna, 13","contactPerson":"","website":"https://giorgini.it/prodotti","emails":["info@giorgini.it"],"phone":"0574 79 241","lat":43.848,"lng":10.979},{"id":"c7686af42","name":"Nord Filati - Martinelli Ginetto S.p.A.","category":"Filati","speciality":"Filati ciniglia, filati fantasia , wool","description":"Filati ciniglia, filati fantasia , wool","tags":["Filati ciniglia","filati fantasia","wool"],"certifications":[],"country":"ITALIA","city":"Casnigo","province":"BG","address":"Via Agro del Castello, 38","contactPerson":"","website":"https://www.martinelliginettogroup.it","emails":["info@martinelliginettogroup.it"],"phone":"035 725011","lat":45.812,"lng":9.869},{"id":"c26d69278","name":"Casa del Filato s.r.l.","category":"Filati","speciality":"Filati Lanieri e cotonieri","description":"Lana , angora , Cashmere , cotone ,seta ,viscosa","tags":["Lana","angora","Cashmere","cotone","seta","viscosa"],"certifications":[],"country":"ITALIA","city":"Seano - Carmignano","province":"PO","address":"Via Galilei, 72/74","contactPerson":"","website":"https://www.casadelfilato.com/it/filati","emails":["info@casafilato.it"],"phone":"055 - 8705983","lat":43.836,"lng":11.045},{"id":"ca9361f4b","name":"Maeko Tessuti e Filati Innovativi","category":"Tessuti","speciality":"Tessuti e filati innovativi","description":"Canapa , Rosa , Lyocell , Aloe","tags":["Canapa","Rosa","Lyocell","Aloe"],"certifications":[],"country":"ITALIA","city":"Quaregna Cerreto","province":"BI","address":"Via Nocchette, 24","contactPerson":"","website":"https://maekotessuti.com","emails":["info@maekotessuti.com","export@maekotessuti.com"],"phone":"159061322","lat":45.588,"lng":8.116},{"id":"c77c65901","name":"Tecnofilati S.r.l. - RESISTEX","category":"Filati","speciality":"Filati Tech performance","description":"Grafene , Bioceramico , Carbon , Silver","tags":["Grafene","Bioceramico","Carbon","Silver"],"certifications":[],"country":"ITALIA","city":"Medolago","province":"BG","address":"Via Bergamo 42/44,","contactPerson":"","website":"https://resistex.com/contatti","emails":["sales@tecnofilati.it","monica.alborghetti@tecnofilati.it"],"phone":"356198227","lat":45.67,"lng":9.494},{"id":"c5a234a94","name":"Opera Campi S.r.l.","category":"Tessuti","speciality":"Tessuti in Canapa alta qualità italiana","description":"Canapa e Cashmere , Canapa , ecc","tags":["Canapa e Cashmere","Canapa","ecc"],"certifications":[],"country":"ITALIA","city":"Parma","province":"PR","address":"Strada Traversetolo 73","contactPerson":"","website":"https://operacampi.com/it","emails":[],"phone":"0000000000","lat":44.801,"lng":10.328},{"id":"c9916b0ad","name":"ESSEGOMMA S.p.A","category":"Filati","speciality":"Filati","description":"Filati in Polipropilene","tags":["Filati in Polipropilene"],"certifications":[],"country":"ITALIA","city":"Misinto","province":"MB","address":"Via Don Minzoni 10","contactPerson":"","website":"https://essegomma.com/it/contatti","emails":["info@essegomma.com"],"phone":"02 96329172 - 02 96720068","lat":45.663,"lng":9.083},{"id":"c7c468803","name":"CARVICO S.p.a.","category":"Tessuti","speciality":"Tessuti Beachwear , competition , Tech , Intimo , ecc..","description":"Tessuti Beachwear , competition , Tech , Intimo , Fitness","tags":["Tessuti Beachwear","competition","Tech","Intimo","Fitness"],"certifications":[],"country":"ITALIA","city":"Carvico","province":"BG","address":"Via Don A. Pedrinelli, 96","contactPerson":"","website":"https://www.carvico.com/contatti","emails":["info@carvico.com"],"phone":"35780111","lat":45.708,"lng":9.48},{"id":"c43131bd2","name":"ASPOFIL","category":"Filati","speciality":"Filati","description":"Cotoni Makò, Mercerizzato , seta, poliestere, lurex, acrilici, filanche, fiammati","tags":["Cotoni Makò","Mercerizzato","seta","poliestere","lurex","acrilici","filanche","fiammati"],"certifications":[],"country":"ITALIA","city":"Nigoline","province":"BS","address":"Via G.Pastore, 5","contactPerson":"","website":"http://www.aspofil.it","emails":["info@aspofil.it"],"phone":"030/984378 - 030/9847182","lat":45.634,"lng":9.983},{"id":"c6a37cb00","name":"Hatfil Italy S.r.l.","category":"Filati","speciality":"Filati per rettilinea e circolare","description":"Cotoni , Cotoni Pima , Aegon , Mercerizzato , cotone/seta , cotone/cashmere","tags":["Cotoni","Cotoni Pima","Aegon","Mercerizzato","cotone/seta","cotone/cashmere"],"certifications":[],"country":"ITALIA","city":"Acquafredda","province":"BS","address":"Via Gerani, 17 - 25010","contactPerson":"","website":"https://hatfil.com","emails":["info@hatfil.it"],"phone":"030 658 69 35","lat":45.307,"lng":10.412},{"id":"c911aa193","name":"COATYARN Srl","category":"Filati","speciality":"Filati innovativi","description":"Filati innovativi ricoperti , High-Grip , high abrasion","tags":["Filati innovativi ricoperti","High-Grip","high abrasion"],"certifications":[],"country":"ITALIA","city":"Ospitaletto","province":"BS","address":"Via 1 Maggio traversa 2 , nr. 32","contactPerson":"","website":"https://www.coatyarn.com","emails":["a.pezzoli@coatyarn.com","c.parimbelli@coatyarn.com","c.finazzi@coatyarn.com"],"phone":"351 4110669 - 030 640594","lat":45.555,"lng":10.073},{"id":"c846edb49","name":"Fulgar S.p.A.","category":"Filati","speciality":"Filati in poliammide , Elastan","description":"Lycra , Q-skin , EVO , ecc","tags":["Lycra","Q-skin","EVO","ecc"],"certifications":[],"country":"ITALIA","city":"Castel Goffredo","province":"MN","address":"Strada Casaloldo, 55","contactPerson":"","website":"https://www.fulgar.com/prodotti/55/q-skin-by-fulgar","emails":["info@fulgar.com"],"phone":"0376 779900 - 0376 780850","lat":45.298,"lng":10.475},{"id":"cdc5f7e4e","name":"Aquafil S.p.A.","category":"Filati","speciality":"Filati sintetici in poliammide , polipropilene","description":"produzione di poliammide 6 e 6.6 e di Dryarn® , ECONYL® , Borgolon & Microlon","tags":["produzione di poliammide 6 e 6.6 e di Dryarn®","ECONYL®","Borgolon & Microlon"],"certifications":["GRS"],"country":"ITALIA","city":"Arco","province":"TN","address":"via Linfano, 9","contactPerson":"","website":"https://www.aquafil.com/it/contatti","emails":["info@aquafil.com","pec.aquafil@aquafil.legalmail.it"],"phone":"0464 581111 - 0464 532267","lat":45.918,"lng":10.885},{"id":"c30450493","name":"Emilcotoni SPA","category":"Filati","speciality":"Filati Cotonieri","description":"Sea Island , Ecopima , Lino , Pima","tags":["Sea Island","Ecopima","Lino","Pima"],"certifications":[],"country":"ITALIA","city":"Piacenza","province":"PC","address":"Viale della Industria, 12,","contactPerson":"","website":"https://www.emilcotoni.it/contatti","emails":["info@emilcotoni.it"],"phone":".0523.60.69.13","lat":45.052,"lng":9.693},{"id":"cf3aff4eb","name":"Pozzi Electa SPA","category":"Filati","speciality":"Filati Naturali , Artificiali , Sintetici","description":"Cammello , YAK , Crabyon , Modal Micro , Ottone , Kuralon","tags":["Cammello","YAK","Crabyon","Modal Micro","Ottone","Kuralon"],"certifications":[],"country":"ITALIA","city":"Milano","province":"MI","address":"Viale Renato Serra, 6","contactPerson":"","website":"https://www.pozzielecta.it/contatti","emails":["pozzielecta@pozzielecta.it"],"phone":"02.33.000.125","lat":45.464,"lng":9.19},{"id":"cd3b95544","name":"GI.TI.BI. Filati srl","category":"Filati","speciality":"Filatii Fantasia","description":"Filatii Fantasia","tags":[],"certifications":[],"country":"ITALIA","city":"Montemurlo","province":"PO","address":"Via Oglio 11,","contactPerson":"","website":"https://www.gitibi.it/contatti.php?lang=ita","emails":["europe@gitibi.it"],"phone":"0574 62.41.41","lat":43.926,"lng":11.037},{"id":"c24379182","name":"Fil-3 S.r.l.","category":"Filati","speciality":"Filatii Fantasia","description":"Cardati, Lane British, Lane Pettinati, Raw e Lane Vintage , puro lino, al lino tencel, filati di alta qualità","tags":["Cardati","Lane British","Lane Pettinati","Raw e Lane Vintage","puro lino","al lino tencel","filati di alta qualità"],"certifications":[],"country":"ITALIA","city":"Montemurlo","province":"PO","address":"Viale Antonio Labriola, 227","contactPerson":"","website":"https://fil3.it/it/primavera-estate-27","emails":["info@fil3.it"],"phone":"0574 652911 - 0574 653358 - 392 1003036","lat":43.926,"lng":11.037},{"id":"c45345be3","name":"Elasten Srl","category":"Filati","speciality":"Filati Elasticizzati","description":"Lavora con elastomero nudo, ricoperto oppure senza elastomero qualsiasi tipo di materiale: lino, ramie, canapa, cotone, viscosa, seta,lana e mistilana, openend, pettinati, cardati, ciniglia, open-end, pettinato, cardato, nylon, poliestere, kevlar, cordura, zylon, dynema,fibre ad alta tenacita’ ecc.)","tags":["Lavora con elastomero nudo","ricoperto oppure senza elastomero qualsiasi tipo di materiale: lino","ramie","canapa","cotone","viscosa","seta","lana e mistilana"],"certifications":[],"country":"ITALIA","city":"Prato","province":"PO","address":"Via Lungo il Ficarello, 18","contactPerson":"","website":"https://www.elasten.it/it/#contatti","emails":["info@elasten.it"],"phone":"0574 663022","lat":43.879,"lng":11.097},{"id":"c11b255c4","name":"Manifattura Italiana Cucirini Spa","category":"Stampa & Ricamo","speciality":"Filati Cucirini","description":"PER CUCITO, MAGLIERIA, RICAMO E APPLICAZIONI TECNICHE","tags":["PER CUCITO","MAGLIERIA","RICAMO E APPLICAZIONI TECNICHE"],"certifications":[],"country":"ITALIA","city":"Vallese","province":"VR","address":"Via R. Spineta, 61","contactPerson":"","website":"https://www.micspa.com/contatti","emails":[],"phone":"045 7134725","lat":45.353,"lng":11.114}];

const CATEGORIES = [
  "Filati",
  "Tessuti",
  "Calze & Calzetteria",
  "Abbigliamento & Intimo",
  "Stampa & Ricamo",
  "Confezioni & Servizi",
  "Packaging & Display",
  "Macchinari",
];

/* Cartella colori dell'index in home: una tinta per categoria */
const CATEGORY_SHADES = {
  "Filati": { bg: "#0A4733", fg: "#CDE97B" },
  "Tessuti": { bg: "#22335F", fg: "#C9D8F4" },
  "Calze & Calzetteria": { bg: "#CEF17B", fg: "#1C4A2B" },
  "Abbigliamento & Intimo": { bg: "#F6CFD6", fg: "#8A3A4D" },
  "Stampa & Ricamo": { bg: "#F5CC55", fg: "#5F430E" },
  "Confezioni & Servizi": { bg: "#CDEDB3", fg: "#265B35" },
  "Packaging & Display": { bg: "#C4E2F4", fg: "#1D4E75" },
  "Macchinari": { bg: "#D9CDEE", fg: "#45306E" },
};

const hexToRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return (n >> 16) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
};

/* ---------- Fiere internazionali (stato calcolato sulla data corrente) ---------- */
const FAIRS = [
  { id: "mu43", name: "Milano Unica 43", city: "Milano", country: "Italia", venue: "Fiera Milano Rho",
    start: "2026-07-07", end: "2026-07-09", focus: "Tessuti e accessori di alta gamma",
    desc: "Il salone italiano del tessile: tessuti e accessori di alta gamma per le collezioni donna, uomo e bambino, con aree trend, focus sostenibilità e il progetto Made in Filo.",
    url: "https://www.milanounica.it" },
  { id: "itx26", name: "Intertextile Shanghai — Autumn", city: "Shanghai", country: "Cina", venue: "NECC — National Exhibition and Convention Center",
    start: "2026-08-25", end: "2026-08-27", focus: "Tessuti per abbigliamento",
    desc: "La più grande piattaforma mondiale per i tessuti da abbigliamento: oltre 3.000 espositori tra fibre, tessuti e accessori, con padiglioni internazionali e area sostenibilità.",
    url: "https://intertextile-shanghai-apparel-fabrics-autumn.hk.messefrankfurt.com/shanghai/en.html" },
  { id: "filo66", name: "Filo 66", city: "Milano", country: "Italia", venue: "Fiera Milano Rho",
    start: "2026-09-15", end: "2026-09-16", focus: "Filati e fibre per tessitura",
    desc: "La rassegna internazionale B2B dei filati e delle fibre per tessitura ortogonale e maglieria circolare: prodotto tecnico, anteprime colore e incontri diretti con le filature.",
    url: "https://filo.it" },
  { id: "pv26", name: "Première Vision Paris", city: "Parigi", country: "Francia", venue: "Parc des Expositions — Paris Nord Villepinte",
    start: "2026-09-15", end: "2026-09-17", focus: "Filati, tessuti, pelle e accessori",
    desc: "Il punto di riferimento europeo per i materiali moda: sei universi merceologici, seminari trend e il forum colore che orienta le collezioni delle stagioni successive.",
    url: "https://www.premierevision.com" },
  { id: "kp26", name: "Kingpins Amsterdam", city: "Amsterdam", country: "Paesi Bassi", venue: "Westergas",
    start: "2026-10-21", end: "2026-10-22", focus: "Denim e sportswear",
    desc: "Il boutique show del denim: tessitori, lavanderie e innovatori della filiera indigo, con un focus forte su circolarità e nuove finiture responsabili.",
    url: "https://www.kingpinsshow.com" },
  { id: "ispo26", name: "ISPO Munich", city: "Monaco di Baviera", country: "Germania", venue: "Messe München",
    start: "2026-12-01", end: "2026-12-03", focus: "Sport, outdoor e tessuti tecnici",
    desc: "Il più grande evento mondiale dello sport business: nell'area Textrends si presentano i tessuti tecnici e le membrane che definiranno le collezioni performance.",
    url: "https://www.ispo.com/en/munich" },
  { id: "ht27", name: "Heimtextil", city: "Francoforte", country: "Germania", venue: "Messe Frankfurt",
    start: "2027-01-12", end: "2027-01-15", focus: "Tessile casa e contract",
    desc: "La fiera internazionale del tessile per la casa e il contract: tendenze d'interni, fibre naturali e riciclate, con il Trend Space che apre l'anno tessile europeo.",
    url: "https://heimtextil.messefrankfurt.com" },
  { id: "pf100", name: "Pitti Filati 100", city: "Firenze", country: "Italia", venue: "Fortezza da Basso",
    start: "2027-01-27", end: "2027-01-29", focus: "Filati per maglieria",
    desc: "L'edizione numero 100 del salone internazionale dei filati per maglieria: le filature italiane presentano le collezioni e lo Spazio Ricerca detta i trend della stagione.",
    url: "https://filati.pittimmagine.com" },
  { id: "pf99", name: "Pitti Filati 99", city: "Firenze", country: "Italia", venue: "Fortezza da Basso",
    start: "2026-06-24", end: "2026-06-26", focus: "Filati per maglieria",
    desc: "Il salone internazionale di riferimento per i filati da maglieria: collezioni PE28, Spazio Ricerca e Fashion at Work alla Fortezza da Basso.",
    url: "https://filati.pittimmagine.com" },
  { id: "tt26", name: "Techtextil", city: "Francoforte", country: "Germania", venue: "Messe Frankfurt",
    start: "2026-04-21", end: "2026-04-24", focus: "Tessili tecnici e nonwoven",
    desc: "La fiera leader mondiale dei tessili tecnici e dei nonwoven: fibre high-tech, compositi e tessuti funzionali per dodici aree di applicazione.",
    url: "https://techtextil.messefrankfurt.com" },
];

const MONTHS_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function fairStatus(f, now = new Date()) {
  const s = new Date(f.start + "T00:00:00");
  const e = new Date(f.end + "T23:59:59");
  if (now > e) return { key: "done", label: "Conclusa" };
  if (now >= s) return { key: "live", label: "In corso" };
  return { key: "next", label: "Prossima", days: Math.ceil((s - now) / 86400000) };
}

function sortFairs(list, now = new Date()) {
  const rank = { live: 0, next: 1, done: 2 };
  return [...list].sort((a, b) => {
    const ra = rank[fairStatus(a, now).key];
    const rb = rank[fairStatus(b, now).key];
    if (ra !== rb) return ra - rb;
    return ra === 2 ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start);
  });
}

function fmtRange(f) {
  const s = new Date(f.start + "T00:00:00");
  const e = new Date(f.end + "T00:00:00");
  if (s.getMonth() === e.getMonth()) return s.getDate() + "–" + e.getDate() + " " + MONTHS_IT[s.getMonth()] + " " + s.getFullYear();
  return s.getDate() + " " + MONTHS_IT[s.getMonth()] + " – " + e.getDate() + " " + MONTHS_IT[e.getMonth()] + " " + e.getFullYear();
}

const CERT_LABELS = {
  GRS: "Global Recycled Standard",
  RWS: "Responsible Wool Standard",
  RMS: "Responsible Mohair Standard",
  GOTS: "Global Organic Textile Standard",
  "OEKO-TEX": "OEKO-TEX Standard 100",
  "ISO 9001": "Sistema di gestione qualità",
  BCI: "Better Cotton Initiative",
};

/* ---------- Trend colori (stagione calcolata sulla data corrente) ----------
   TRENDS_ENDPOINT: se valorizzato (es. API che aggrega Pantone report,
   magazine e passerelle), i dati live sostituiscono il dataset curato. */
const TRENDS_ENDPOINT = null;

function seasonKey(d = new Date()) {
  const m = d.getMonth(), y = d.getFullYear();
  if (m >= 2 && m <= 7) return "SS-" + y;           // mar–ago → Primavera/Estate
  return "FW-" + (m <= 1 ? y - 1 : y);              // set–feb → Autunno/Inverno
}

const TREND_SEASONS = {
  "SS-2026": {
    label: "Primavera / Estate 2026",
    hero: {
      name: "Cloud Dancer", pantone: "11-4201", hex: "#F0EEE4",
      note: "Pantone Color of the Year 2026: un bianco morbido e luminoso, simbolo di leggerezza, calma e nuovo minimalismo. Perfetto su tailoring pulito, lini e cotoni.",
    },
    colors: [
      { name: "Marina", pantone: "17-4041", hex: "#4F84C4", freq: 82 },
      { name: "Tickled Pink", pantone: "12-2803", hex: "#F5B0C2", freq: 74 },
      { name: "Butter Yellow", pantone: "11-0710", hex: "#F3E3A9", freq: 69 },
      { name: "Acacia", pantone: "13-0640", hex: "#DCC94C", freq: 61 },
      { name: "Aqua", pantone: "12-4610", hex: "#9BD4D8", freq: 55 },
      { name: "Apricot Crush", pantone: "16-1435", hex: "#EF8E63", freq: 48 },
      { name: "Mocha Mousse", pantone: "17-1230", hex: "#A47864", freq: 40 },
    ],
    sources: "Pantone Fashion Color Trend Report (NYFW SS26) · Vogue · WWD · Elle",
  },
  "FW-2026": {
    label: "Autunno / Inverno 2026-27",
    hero: {
      name: "Chicory Coffee", pantone: "19-1419", hex: "#53352E",
      note: "Il marrone profondo guida la stagione fredda: caldo e materico, valorizza lane, cashmere e superfici spazzolate.",
    },
    colors: [
      { name: "Tawny Port", pantone: "19-1725", hex: "#64313E", freq: 84 },
      { name: "Deep Forest", pantone: "19-6110", hex: "#35463D", freq: 76 },
      { name: "Butter Yellow", pantone: "11-0710", hex: "#F3E3A9", freq: 64 },
      { name: "Sharkskin", pantone: "17-3914", hex: "#838487", freq: 58 },
      { name: "French Blue", pantone: "18-4140", hex: "#3E6FB0", freq: 51 },
      { name: "Winter White", pantone: "11-0507", hex: "#F2EFE4", freq: 46 },
      { name: "Chili Pepper", pantone: "19-1557", hex: "#9B1B30", freq: 41 },
    ],
    sources: "Pantone Fashion Color Trend Report · Vogue · WWD · Elle",
  },
};

function getTrends(now = new Date()) {
  const k = seasonKey(now);
  if (TREND_SEASONS[k]) return { key: k, live: true, ...TREND_SEASONS[k] };
  const keys = Object.keys(TREND_SEASONS).sort();
  const same = keys.filter((x) => x.startsWith(k.slice(0, 2))).pop();
  const use = same || keys[keys.length - 1];
  return { key: use, live: false, ...TREND_SEASONS[use] };
}

function useTrends() {
  const [data, setData] = useState(() => getTrends());
  useEffect(() => {
    if (!TRENDS_ENDPOINT) return;
    let dead = false;
    fetch(TRENDS_ENDPOINT + "?season=" + seasonKey())
      .then((r) => r.json())
      .then((j) => { if (!dead && j && j.colors) setData((d) => ({ ...d, ...j, live: true })); })
      .catch(() => {});
    return () => { dead = true; };
  }, []);
  return data;
}

/* ---------- Cartelle colori per azienda (deterministiche, stile Pantone) ---------- */
const SH = {
  ecru:       { n: "Ecru", p: "11-0809", h: "#F1EADA" },
  ivory:      { n: "Avorio", p: "11-0602", h: "#F7F3E8" },
  white:      { n: "Bianco ottico", p: "11-0601", h: "#F4F5F0" },
  sand:       { n: "Sabbia", p: "13-1010", h: "#DECAAF" },
  butter:     { n: "Burro", p: "12-0722", h: "#EFE1A7" },
  saffron:    { n: "Zafferano", p: "14-1064", h: "#F3A712" },
  camel:      { n: "Cammello", p: "17-1224", h: "#B0846A" },
  tobacco:    { n: "Tabacco", p: "17-1327", h: "#9A6B4F" },
  kraft:      { n: "Kraft", p: "16-1235", h: "#B3855C" },
  terracotta: { n: "Terracotta", p: "16-1526", h: "#C26E51" },
  scarlet:    { n: "Scarlatto", p: "18-1662", h: "#CD2C2E" },
  bordeaux:   { n: "Bordeaux", p: "19-1725", h: "#64313E" },
  blush:      { n: "Cipria", p: "13-1520", h: "#F2C4C2" },
  rose:       { n: "Rosa antico", p: "16-1518", h: "#C98D8D" },
  lilac:      { n: "Lilla", p: "15-3817", h: "#B9A6C9" },
  moss:       { n: "Muschio", p: "16-0421", h: "#8A8F5C" },
  sage:       { n: "Salvia", p: "15-6316", h: "#A3B5A0" },
  forest:     { n: "Bosco", p: "19-6110", h: "#35463D" },
  aqua:       { n: "Acqua", p: "12-4610", h: "#9BD4D8" },
  marine:     { n: "Marina", p: "17-4041", h: "#4F84C4" },
  denim:      { n: "Denim", p: "18-4025", h: "#4E6E94" },
  navy:       { n: "Navy", p: "19-4024", h: "#2A3958" },
  indigo:     { n: "Indaco", p: "19-3928", h: "#49516D" },
  grey:       { n: "Grigio melange", p: "16-3801", h: "#A7A2A0" },
  silver:     { n: "Argento", p: "14-5002", h: "#ADB0B2" },
  steel:      { n: "Acciaio", p: "18-4005", h: "#6E7376" },
  ink:        { n: "Nero inchiostro", p: "19-4007", h: "#2B2C30" },
};

const SHADE_POOLS = {
  "Filati": [SH.ecru, SH.camel, SH.moss, SH.indigo, SH.terracotta, SH.grey, SH.bordeaux, SH.butter, SH.sand, SH.forest],
  "Tessuti": [SH.navy, SH.steel, SH.forest, SH.silver, SH.aqua, SH.ink, SH.denim, SH.moss, SH.white, SH.marine],
  "Calze & Calzetteria": [SH.white, SH.grey, SH.navy, SH.scarlet, SH.saffron, SH.aqua, SH.ink, SH.denim, SH.blush],
  "Abbigliamento & Intimo": [SH.blush, SH.ivory, SH.rose, SH.navy, SH.sand, SH.lilac, SH.grey, SH.bordeaux],
  "Stampa & Ricamo": [SH.scarlet, SH.marine, SH.saffron, SH.forest, SH.lilac, SH.ink, SH.aqua, SH.rose],
  "Confezioni & Servizi": [SH.ivory, SH.sand, SH.grey, SH.kraft, SH.steel, SH.white],
  "Packaging & Display": [SH.kraft, SH.ink, SH.white, SH.sand, SH.steel, SH.terracotta],
  "Macchinari": [SH.steel, SH.ink, SH.silver, SH.grey, SH.navy, SH.scarlet],
};

function hashId(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function companyShades(c) {
  const pool = SHADE_POOLS[c.category] || SHADE_POOLS["Filati"];
  let seed = hashId(c.id);
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 4 + Math.floor(rnd() * 3));
}

/* ---------- Messaggistica fornitori (thread demo + risposte simulate) ---------- */
const SEED_THREADS = [
  { companyId: "c3fa34d00", msgs: [ // Penn Solutions — tessuti GRS
    { id: "t1a", from: "sup", text: "Buongiorno! Grazie per l'interesse nei nostri tessuti tecnici GRS. Ci raccontate il progetto?", at: "09:12" },
    { id: "t1b", from: "me", text: "Buongiorno, cerchiamo un tessuto grip riciclato per una capsule di leggings sportivi. MOQ e tempi?", at: "09:30" },
    { id: "t1c", from: "sup", text: "Perfetto: per il grip GRS partiamo da 300 mt per colore, consegna 4-5 settimane. Vi inviamo cartella colori e scheda tecnica.", at: "09:41" },
  ] },
  { companyId: "c5b98b087", msgs: [ // FILMAR — filati cotonieri
    { id: "t2a", from: "me", text: "Salve, che disponibilità avete di Filoscozia tinto filo per la SS27?", at: "Ieri" },
    { id: "t2b", from: "sup", text: "Buongiorno! Collezione SS27 disponibile a campionario. Su quali tonalità state lavorando?", at: "Ieri" },
  ] },
  { companyId: "c6fd517e2", msgs: [ // Ilaria Manifatture Lane — mohair RMS
    { id: "t3a", from: "me", text: "Buongiorno, cerchiamo un mohair certificato RMS per maglieria FW26.", at: "Lun" },
    { id: "t3b", from: "sup", text: "Abbiamo un mohair RMS in 18 colori di cartella. Vi mandiamo le cartelle e i certificati aggiornati.", at: "Lun" },
  ] },
];

const AUTO_REPLIES = [
  "Grazie del messaggio! L'ufficio commerciale vi risponde entro la giornata.",
  "Ricevuto — prepariamo cartella colori e scheda tecnica aggiornate.",
  "Perfetto, giriamo la richiesta alla produzione e torniamo con MOQ e tempi di consegna.",
];
const autoReply = (n) => AUTO_REPLIES[n % AUTO_REPLIES.length];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function docsFor(c) {
  const stamp = new Date().toLocaleDateString("it-IT");
  const docs = [{
    id: "profile", label: "Profilo aziendale", type: "TXT", file: slug(c.name) + "_profilo.txt",
    make: () => [
      "TEXA — PROFILO AZIENDALE (documento dimostrativo)", "",
      c.name,
      (c.address ? c.address + " — " : "") + c.city + " " + (c.province || "") + " · " + c.country,
      "Categoria: " + c.category,
      "Specialità: " + c.speciality,
      "Descrizione: " + c.description,
      c.website ? "Sito: " + c.website : "",
      "Certificazioni: " + (c.certifications.join(", ") || "—"),
      "", "Generato da TEXA il " + stamp,
    ].filter(Boolean).join("\n"),
  }];
  c.certifications.forEach((cert) => docs.push({
    id: cert, label: "Certificato " + cert, type: "TXT", file: slug(c.name) + "_" + slug(cert) + ".txt",
    make: () => [
      "TEXA — ATTESTAZIONE CERTIFICAZIONE (documento dimostrativo)", "",
      "Azienda: " + c.name,
      "Standard: " + cert + (CERT_LABELS[cert] ? " — " + CERT_LABELS[cert] : ""),
      "Stato: dichiarata dal fornitore",
      "", "Documento dimostrativo generato da TEXA il " + stamp + ".",
      "Richiedi in chat il certificato ufficiale con numero di licenza.",
    ].join("\n"),
  }));
  return docs;
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

const MARQUEE = ["LINEN", "MERINO", "GRS RECYCLED", "CASHMERE", "HEMP", "SEAMLESS", "MOHAIR", "JACQUARD", "ECONYL", "PIMA COTTON", "CHENILLE", "LYOCELL", "TECH YARNS", "MADE IN ITALY"];

/* ---------- AI-ready query interpreter (MVP: keyword matching) ---------- */
const MATERIAL_HINTS = ["lino", "linen", "canapa", "hemp", "cotone", "cotton", "lana", "wool", "seta", "silk", "cashmere", "mohair", "alpaca", "viscosa", "nylon", "poliestere", "polipropilene", "riciclat", "recycled", "econyl", "dryarn", "lyocell", "bamboo", "grafene", "merino"];
const CATEGORY_HINTS = [
  [["filat", "yarn", "filo "], "Filati"],
  [["tessut", "jersey", "fabric"], "Tessuti"],
  [["calze", "calzett", "hosiery", "socks"], "Calze & Calzetteria"],
  [["intimo", "underwear", "abbigliament", "leggings", "pigiam"], "Abbigliamento & Intimo"],
  [["stampa", "ricam", "serigraf", "sublimat", "print", "embroider"], "Stampa & Ricamo"],
  [["confezion", "stiro"], "Confezioni & Servizi"],
  [["scatol", "espositor", "packaging", "appendin", "etichett"], "Packaging & Display"],
  [["macchin", "machine"], "Macchinari"],
];

function interpretQuery(q) {
  const t = q.toLowerCase();
  let category = null;
  for (const [hints, cat] of CATEGORY_HINTS) {
    if (hints.some((h) => t.includes(h))) { category = cat; break; }
  }
  const materials = MATERIAL_HINTS.filter((m) => t.includes(m));
  const keywords = t.split(/[\s,]+/).filter((w) => w.length > 2);
  return { category, materials, keywords };
}

function searchCompanies(query, activeCategory) {
  const intent = query ? interpretQuery(query) : { category: null, materials: [], keywords: [] };
  const cat = activeCategory || intent.category;
  return COMPANIES.filter((c) => {
    if (cat && c.category !== cat) return false;
    if (!query) return true;
    const hay = (c.name + " " + c.speciality + " " + c.description + " " + c.tags.join(" ") + " " + c.city + " " + c.certifications.join(" ")).toLowerCase();
    const kws = intent.keywords;
    if (kws.length === 0) return true;
    return kws.some((k) => hay.includes(k)) || intent.materials.some((m) => hay.includes(m));
  });
}

/* ---------- Mock products from real tags ---------- */
const SWATCHES = [
  "linear-gradient(135deg,#F4F5F2,#E1E3DE)",
  "linear-gradient(135deg,#EEF2EF,#CBD6CD)",
  "linear-gradient(135deg,#F6F6F4,#DDE2DC)",
  "linear-gradient(135deg,#EBF1ED,#BFD0C4)",
  "linear-gradient(135deg,#F2F3F0,#D6DAD3)",
  "linear-gradient(135deg,#E8EEE9,#AFC4B6)",
];
function mockProducts(c) {
  return c.tags.slice(0, 4).map((t, i) => ({
    id: c.id + "-p" + i,
    name: t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
    moq: "Su richiesta",
    swatch: SWATCHES[(t.length + i) % SWATCHES.length],
  }));
}

/* ---------- SVG fallback map (usata solo se Leaflet non carica) ---------- */
const MAP = { latMax: 47.3, latMin: 36.4, lngMin: 6.4, lngMax: 18.8, w: 400, h: 540 };
const px = (lng) => ((lng - MAP.lngMin) / (MAP.lngMax - MAP.lngMin)) * MAP.w;
const py = (lat) => ((MAP.latMax - lat) / (MAP.latMax - MAP.latMin)) * MAP.h;
const inItaly = (c) => c.lat >= MAP.latMin && c.lat <= MAP.latMax && c.lng >= MAP.lngMin && c.lng <= MAP.lngMax;
const ITALY = [[45.9,6.8],[46.4,8.0],[46.5,9.3],[46.9,10.5],[47.0,12.2],[46.6,13.7],[45.6,13.8],[45.4,12.5],[44.8,12.4],[44.2,12.6],[43.6,13.6],[42.5,14.3],[42.0,15.0],[41.9,16.2],[41.4,16.1],[41.1,17.0],[40.5,18.0],[40.1,18.5],[39.8,18.4],[40.0,18.0],[40.3,17.4],[40.5,16.8],[39.9,16.6],[39.0,17.2],[38.9,16.6],[37.9,16.1],[38.3,15.8],[38.9,16.2],[40.0,15.6],[40.6,14.8],[41.2,13.0],[41.9,12.2],[42.4,11.2],[43.0,10.5],[43.6,10.3],[44.1,9.8],[44.4,8.9],[43.9,8.0],[43.8,7.5],[44.4,7.0],[45.1,6.7]];
const SICILY = [[38.2,12.4],[38.3,13.4],[38.1,15.5],[37.5,15.1],[36.7,15.1],[37.1,13.3],[37.6,12.5]];
const SARDINIA = [[41.2,9.2],[40.9,9.7],[39.2,9.6],[38.9,8.9],[38.9,8.4],[40.3,8.3],[41.0,8.2],[41.2,8.9]];
const toPath = (pts) => "M" + pts.map(([la, lo]) => px(lo).toFixed(1) + " " + py(la).toFixed(1)).join(" L") + " Z";

/* ============================================================ */

export default function TexaApp() {
  const [view, setView] = useState("home");
  const [prevView, setPrevView] = useState("results");
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [rfqOpen, setRfqOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [rfqSent, setRfqSent] = useState(false);
  const [threads, setThreads] = useState(SEED_THREADS);
  const [activeThread, setActiveThread] = useState(SEED_THREADS[0].companyId);
  const [selectedFair, setSelectedFair] = useState(null);

  const results = useMemo(() => searchCompanies(query, activeCategory), [query, activeCategory]);
  const company = useMemo(() => COMPANIES.find((c) => c.id === selectedId) || null, [selectedId]);
  const intent = useMemo(() => (query ? interpretQuery(query) : null), [query]);

  useEffect(() => { window.scrollTo(0, 0); }, [view, selectedId]);

  const goSearch = (q, cat = null) => { setQuery(q || ""); setInput(q || ""); setActiveCategory(cat); setView("results"); };
  const openCompany = (id) => { setPrevView(view === "company" ? prevView : view); setSelectedId(id); setView("company"); setRfqSent(false); setContactOpen(false); };
  const submitRfq = (form) => {
    setRfqs((p) => [...p, { id: "rfq" + Date.now(), companyId: company.id, ...form, createdAt: new Date().toISOString(), status: "inviata" }]);
    setRfqOpen(false); setRfqSent(true);
  };
  const openThread = (id) => {
    setThreads((p) => (p.some((t) => t.companyId === id) ? p : [{ companyId: id, msgs: [] }, ...p]));
    setActiveThread(id);
    setView("messages");
  };
  const sendMsg = (companyId, text) => {
    const ts = () => new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    setThreads((p) => p.map((t) => (t.companyId === companyId ? { ...t, msgs: [...t.msgs, { id: "u" + Date.now(), from: "me", text, at: ts() }] } : t)));
    setTimeout(() => {
      setThreads((p) => p.map((t) => (t.companyId === companyId ? { ...t, msgs: [...t.msgs, { id: "s" + Date.now(), from: "sup", text: autoReply(t.msgs.length), at: ts() }] } : t)));
    }, 1400);
  };
  const nav = (v) => { setView(v); if (v !== "fairs") setSelectedFair(null); };

  return (
    <div className="texa">
      <Style />
      <header className="hdr">
        <button className="logo" onClick={() => { nav("home"); setActiveCategory(null); setQuery(""); setInput(""); }}>TEXA</button>
        <nav className="nav" aria-label="Sezioni">
          <button className={"nav-l" + (view === "search" || view === "results" ? " on" : "")} onClick={() => nav("search")}>Ricerca</button>
          <button className={"nav-l" + (view === "fairs" ? " on" : "")} onClick={() => nav("fairs")}>Fiere</button>
          <button className={"nav-l" + (view === "messages" ? " on" : "")} onClick={() => nav("messages")}>Messaggi</button>
        </nav>
        {rfqs.length > 0 && <span className="rfq-pill">{rfqs.length} RFQ</span>}
      </header>

      {view === "home" && <Home onSearch={goSearch} onCategory={(c) => goSearch("", c)} onFairs={() => nav("fairs")} />}
      {view === "search" && <SearchPage onSearch={goSearch} onCategory={(c) => goSearch("", c)} />}
      {view === "fairs" && <FairsPage selected={selectedFair} setSelected={setSelectedFair} />}
      {view === "messages" && (
        <MessagesPage threads={threads} activeId={activeThread} setActiveId={setActiveThread}
          onSend={sendMsg} onStart={openThread} onOpenCompany={openCompany} />
      )}
      {view === "results" && (
        <Results
          input={input} setInput={setInput}
          onSubmit={() => { setQuery(input); setActiveCategory(null); }}
          results={results} intent={intent}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          hoveredId={hoveredId} setHoveredId={setHoveredId}
          onOpen={openCompany}
        />
      )}
      {view === "company" && company && (
        <CompanyPage c={company} onBack={() => setView(prevView === "messages" ? "messages" : "results")}
          onRfq={() => setRfqOpen(true)} onMessage={() => openThread(company.id)}
          contactOpen={contactOpen} setContactOpen={setContactOpen} rfqSent={rfqSent} />
      )}
      {rfqOpen && company && <RfqModal c={company} onClose={() => setRfqOpen(false)} onSubmit={submitRfq} />}

      <footer className="foot">
        <div className="foot-giant" aria-hidden="true">TEXA</div>
        <div className="foot-row">
          <span>Textile Network & Marketplace</span>
          <span>{COMPANIES.length} suppliers · Made in Italy</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Elementi grafici home ---------------- */
function Marquee({ reverse = false }) {
  return (
    <div className={"marquee" + (reverse ? " rev" : "")} aria-hidden="true">
      <div className="marquee-track">
        {[...MARQUEE, ...MARQUEE].map((w, i) => <span key={i}>{w}<em>✦</em></span>)}
      </div>
    </div>
  );
}

function Spool({ x, y, c, cls }) {
  return (
    <g transform={"translate(" + x + " " + y + ")"} className={cls}>
      <g className="spool-in">
        <rect x="-5" y="-9" width="46" height="10" rx="4" fill="#EFF0EC" />
        <rect x="-5" y="71" width="46" height="10" rx="4" fill="#EFF0EC" />
        <rect x="0" y="0" width="36" height="72" rx="9" fill={c} />
        {[12, 24, 36, 48, 60].map((yy) => (
          <line key={yy} x1="4" y1={yy} x2="32" y2={yy} stroke="#fff" strokeWidth="2" opacity=".26" />
        ))}
      </g>
    </g>
  );
}

/* Rocche di filo → il filo si tende e intreccia un tessuto (solo decorativo) */
function HeroArt() {
  const weftColors = ["#4F84C4", "#B5D054", "#E8A9B8", "#0A4733"];
  return (
    <div className="hero-art" aria-hidden="true">
      <svg viewBox="0 0 560 420" fill="none">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={"w" + i} x1={330 + i * 21} y1="78" x2={330 + i * 21} y2="342" stroke="#E7EAE5" strokeWidth="3" strokeLinecap="round" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={"t" + i} className="weft-l" style={{ animationDelay: (1.15 + i * 0.14) + "s" }}
            x1="326" y1={92 + i * 21.5} x2="544" y2={92 + i * 21.5}
            stroke={weftColors[i % 4]} strokeWidth="7" strokeLinecap="round" opacity="0.9" />
        ))}
        <path className="thread t1" d="M98 96 C 190 96, 250 118, 326 113" stroke="#4F84C4" strokeWidth="2.5" />
        <path className="thread t2" d="M98 218 C 205 218, 255 175, 326 156" stroke="#B5D054" strokeWidth="2.5" />
        <path className="thread t3" d="M98 338 C 215 338, 265 245, 326 199" stroke="#E8A9B8" strokeWidth="2.5" />
        <Spool x={62} y={60} c="#4F84C4" cls="sp1" />
        <Spool x={62} y={182} c="#B5D054" cls="sp2" />
        <Spool x={62} y={302} c="#E8A9B8" cls="sp3" />
      </svg>
    </div>
  );
}

/* Metro da sarto (decorativo, in fondo all'hero) */
function TapeMeasure() {
  return (
    <svg className="tape" viewBox="0 0 560 34" aria-hidden="true">
      <rect x="0.5" y="6.5" width="559" height="23" rx="8" fill="#F5F6F3" stroke="#E2E4DF" />
      {Array.from({ length: 56 }).map((_, i) => {
        const x = 10 + i * 9.8;
        const major = i % 10 === 0;
        return <line key={i} x1={x} y1="6.5" x2={x} y2={major ? 21 : 14} stroke="#9AA29A" strokeWidth="1" />;
      })}
      {Array.from({ length: 6 }).map((_, i) => (
        <text key={"n" + i} x={13 + i * 98} y="27" fontSize="7.5" fontWeight="600" fill="#8A928A" fontFamily="Inter, sans-serif">{50 + i}</text>
      ))}
    </svg>
  );
}

/* ---------------- Home ---------------- */
function Home({ onSearch, onCategory, onFairs }) {
  const [q, setQ] = useState("");
  const nextFairs = useMemo(() => sortFairs(FAIRS).filter((f) => fairStatus(f).key !== "done").slice(0, 3), []);
  return (
    <main>
      <section className="hero">
        <HeroArt />
        <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Textile network & marketplace</p>
        <h1 className="mega">
          <span className="line l1">Search less.</span>
          <span className="line l2 hollow">Source better.</span>
        </h1>
        <form className="searchbar" onSubmit={(e) => { e.preventDefault(); onSearch(q); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Linen yarn, seamless, GRS recycled…" aria-label="Search" />
          <button type="submit">Search →</button>
        </form>
        <p className="hint">
          <button className="hint-link" onClick={() => onSearch("filati di lino")}>filati di lino</button>
          <button className="hint-link" onClick={() => onSearch("calze sportive")}>calze sportive</button>
          <button className="hint-link" onClick={() => onSearch("recycled GRS")}>recycled GRS</button>
        </p>
        <TapeMeasure />
      </section>

      <Marquee />

      <section className="index">
        <div className="index-head">
          <h2>Index</h2>
          <span className="index-sub">{COMPANIES.length} fornitori verificati</span>
        </div>
        <div className="cat-cards">
          {CATEGORIES.map((cat) => {
            const n = COMPANIES.filter((x) => x.category === cat).length;
            const sh = CATEGORY_SHADES[cat] || { bg: "#F2F3F0", fg: "#141414" };
            return (
              <button key={cat} className="cat-card" style={{ background: sh.bg, color: sh.fg }} onClick={() => onCategory(cat)}>
                <span className="cat-name">{cat.toLowerCase()}</span>
                <span className="cat-specs">
                  <span>{n} fornitori</span>
                  <span>RGB: {hexToRgb(sh.bg)}</span>
                  <span>HEX: {sh.bg}</span>
                  <span className="cat-arrow">Esplora ↗</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="fairs">
        <div className="index-head">
          <h2>Fiere</h2>
          <button className="see-all" onClick={onFairs}>Calendario completo →</button>
        </div>
        <div className="fair-row">
          {nextFairs.map((f) => {
            const st = fairStatus(f);
            return (
              <button key={f.id} className="fair-card" onClick={onFairs}>
                <span className="fair-top">
                  <span className="fair-name">{f.name}</span>
                  <Badge st={st} />
                </span>
                <span className="fair-meta">{fmtRange(f)} · {f.city}</span>
                <span className="fair-meta">{f.focus}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Marquee reverse />
    </main>
  );
}

/* ---------------- Results ---------------- */
function Results({ input, setInput, onSubmit, results, intent, activeCategory, setActiveCategory, hoveredId, setHoveredId, onOpen }) {
  const abroad = results.filter((c) => !inItaly(c));
  return (
    <main className="res">
      <form className="searchbar compact" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Linen yarn, seamless, GRS recycled…" aria-label="Search" />
        <button type="submit">Search →</button>
      </form>

      <div className="chips" role="tablist" aria-label="Categorie">
        <button className={"chip" + (!activeCategory ? " on" : "")} onClick={() => setActiveCategory(null)}>Tutte</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={"chip" + (activeCategory === c ? " on" : "")} onClick={() => setActiveCategory(activeCategory === c ? null : c)}>{c}</button>
        ))}
      </div>

      {intent && (intent.category || intent.materials.length > 0) && (
        <p className="ai-note">
          <span className="ai-dot" aria-hidden="true" />
          Ricerca interpretata{intent.materials.length > 0 && <> — materiali: <strong>{intent.materials.join(", ")}</strong></>}{intent.category && !activeCategory && <> — categoria: <strong>{intent.category}</strong></>}
        </p>
      )}

      <div className="res-grid">
        <div className="res-list">
          <p className="res-count">{results.length} risultat{results.length === 1 ? "o" : "i"}</p>
          {results.length === 0 && (
            <div className="empty">
              <p>Nessuna azienda trovata.</p>
              <p className="empty-sub">Prova con un materiale ("lino", "cotone") o una lavorazione ("ricamo", "stampa").</p>
            </div>
          )}
          {results.map((c) => (
            <article key={c.id}
              className={"card" + (hoveredId === c.id ? " hl" : "")}
              onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)}
              onClick={() => onOpen(c.id)} tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onOpen(c.id)}>
              <div className="card-top">
                <h3>{c.name}</h3>
                <PaletteDots c={c} n={4} />
                <span className="card-arrow" aria-hidden="true">↗</span>
              </div>
              <p className="card-desc">{c.description}</p>
              <div className="card-meta">
                <span className="pill">{c.category}</span>
                <span className="loc">{c.city}{c.province === "PL" ? " · PL" : c.province ? " (" + c.province + ")" : ""}</span>
                {c.certifications.map((cert) => <span key={cert} className="cert" title={CERT_LABELS[cert] || cert}>{cert}</span>)}
              </div>
            </article>
          ))}
        </div>

        <aside className="res-map">
          <LiveMap companies={results.filter(inItaly)} hoveredId={hoveredId} setHoveredId={setHoveredId} onOpen={onOpen} />
          {abroad.length > 0 && <p className="abroad">+{abroad.length} partner estero ({abroad.map((c) => c.city).join(", ")})</p>}
        </aside>
      </div>
    </main>
  );
}

/* ---------------- Mappa reale (Leaflet + OpenStreetMap/CARTO) ---------------- */
function LiveMap({ companies, hoveredId, setHoveredId, onOpen }) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef({});
  const [status, setStatus] = useState("loading"); // loading | ready | failed

  useEffect(() => {
    let dead = false;
    const init = () => {
      if (dead || !boxRef.current || mapRef.current || !window.L) return;
      const L = window.L;
      const map = L.map(boxRef.current, { scrollWheelZoom: false, attributionControl: true });
      map.setView([43.4, 11.5], 5);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · © CARTO", subdomains: "abcd", maxZoom: 18,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setStatus("ready");
      setTimeout(() => map.invalidateSize(), 150);
    };
    if (window.L) { init(); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = init;
    s.onerror = () => setStatus("failed");
    document.head.appendChild(s);
    const t = setTimeout(() => { if (!window.L) setStatus("failed"); }, 7000);
    return () => { dead = true; clearTimeout(t); if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // markers
  useEffect(() => {
    const L = window.L;
    if (status !== "ready" || !L || !layerRef.current) return;
    layerRef.current.clearLayers();
    markersRef.current = {};
    companies.forEach((c) => {
      const icon = L.divIcon({ className: "", html: '<div class="lpin"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
      const m = L.marker([c.lat, c.lng], { icon }).addTo(layerRef.current);
      m.bindTooltip(c.name, { direction: "top", offset: [0, -8], className: "ltip" });
      m.on("click", () => onOpen(c.id));
      m.on("mouseover", () => setHoveredId(c.id));
      m.on("mouseout", () => setHoveredId(null));
      markersRef.current[c.id] = m;
    });
    if (companies.length > 0) {
      const b = L.latLngBounds(companies.map((c) => [c.lat, c.lng]));
      mapRef.current.fitBounds(b.pad(0.18), { maxZoom: 9 });
    }
  }, [status, companies]);

  // hover sync (list → map)
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, m]) => {
      const el = m.getElement && m.getElement();
      if (!el) return;
      const dot = el.querySelector(".lpin");
      if (dot) dot.classList.toggle("on", id === hoveredId);
    });
  }, [hoveredId, status, companies]);

  if (status === "failed") return <FallbackMap companies={companies} hoveredId={hoveredId} setHoveredId={setHoveredId} onOpen={onOpen} />;
  return (
    <div className="mapwrap">
      <div ref={boxRef} className="leaflet-box" />
      {status === "loading" && <div className="map-loading">Caricamento mappa…</div>}
    </div>
  );
}

function FallbackMap({ companies, hoveredId, setHoveredId, onOpen }) {
  return (
    <div className="mapwrap">
      <svg viewBox={"0 0 " + MAP.w + " " + MAP.h} className="svgmap" role="img" aria-label={"Mappa con " + companies.length + " aziende"}>
        <path d={toPath(ITALY)} fill="#F2F3F0" stroke="#E1E3DE" strokeWidth="1.2" strokeLinejoin="round" />
        <path d={toPath(SICILY)} fill="#F2F3F0" stroke="#E1E3DE" strokeWidth="1.2" />
        <path d={toPath(SARDINIA)} fill="#F2F3F0" stroke="#E1E3DE" strokeWidth="1.2" />
        {companies.map((c) => {
          const on = hoveredId === c.id;
          return (
            <g key={c.id} className="pin" transform={"translate(" + px(c.lng).toFixed(1) + "," + py(c.lat).toFixed(1) + ")"}
              onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)} onClick={() => onOpen(c.id)}>
              <circle r={on ? 10 : 7} fill={on ? "var(--green)" : "rgba(20,20,20,.08)"} />
              <circle r={on ? 4.4 : 3.2} fill={on ? "#fff" : "var(--ink)"} stroke={on ? "var(--ink)" : "#fff"} strokeWidth="1.4" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- Company page ---------------- */
function CompanyPage({ c, onBack, onRfq, onMessage, contactOpen, setContactOpen, rfqSent }) {
  const products = mockProducts(c);
  const shades = companyShades(c);
  const initials = c.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <main className="co">
      <button className="back" onClick={onBack}>← Indietro</button>
      <div className="co-hero">
        <div className="mono" aria-hidden="true">{initials}</div>
        <div className="co-id">
          <span className="pill">{c.category}</span>
          <div className="co-name">
            <h1>{c.name}</h1>
            <PaletteDots c={c} n={6} />
          </div>
          <p className="co-loc">{c.address ? c.address + ", " : ""}{c.city} {c.province && "(" + c.province + ")"} · {c.country}</p>
        </div>
        <div className="co-cta">
          <button className="btn primary" onClick={() => setContactOpen(!contactOpen)}>Contatta</button>
          <button className="btn" onClick={onMessage}>Messaggio</button>
          <button className="btn" onClick={onRfq}>Richiedi preventivo</button>
        </div>
      </div>

      {rfqSent && <div className="ok">Richiesta inviata a {c.name}. Riceverai risposta all'email indicata.</div>}

      {contactOpen && (
        <div className="contact-panel">
          {c.contactPerson && <p><span className="k">Referente</span>{c.contactPerson}</p>}
          {c.emails.length > 0 && <p><span className="k">Email</span>{c.emails.map((e) => <a key={e} href={"mailto:" + e}>{e}</a>)}</p>}
          {c.phone && <p><span className="k">Tel</span><a href={"tel:" + c.phone.replace(/[^\d+]/g, "")}>{c.phone}</a></p>}
          {c.website && <p><span className="k">Sito</span><a href={c.website} target="_blank" rel="noreferrer">{c.website.replace(/^https?:\/\//, "")}</a></p>}
          {c.emails.length === 0 && !c.phone && !c.website && <p>Contatto disponibile tramite richiesta di preventivo.</p>}
        </div>
      )}

      <section className="co-sec">
        <h2>Specializzazione</h2>
        <p className="co-desc">{c.description}</p>
        <div className="tagrow">{c.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      </section>

      <section className="co-sec">
        <h2>Cartella colori</h2>
        <p className="co-desc">L'identità cromatica del fornitore: le tonalità trattate, con il riferimento Pantone più vicino.</p>
        <div className="shade-row">{shades.map((s) => <ShadeChip key={s.n} s={s} />)}</div>
      </section>

      {c.certifications.length > 0 && (
        <section className="co-sec">
          <h2>Certificazioni</h2>
          <div className="tagrow">
            {c.certifications.map((cert) => (
              <span key={cert} className="cert big">{cert}<small>{CERT_LABELS[cert] || ""}</small></span>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="co-sec">
          <h2>Prodotti</h2>
          <div className="prods">
            {products.map((p) => (
              <div key={p.id} className="prod">
                <div className="prod-swatch" style={{ background: p.swatch }} aria-hidden="true" />
                <span className="prod-name">{p.name}</span>
                <span className="prod-meta">MOQ {p.moq}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/* ---------------- RFQ modal ---------------- */
function RfqModal({ c, onClose, onSubmit }) {
  const [form, setForm] = useState({ product: "", quantity: "", message: "", contactName: "", contactEmail: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.product && form.contactName && form.contactEmail.includes("@");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Richiedi preventivo">
        <div className="modal-top">
          <h3>Richiedi preventivo</h3>
          <button className="x" onClick={onClose} aria-label="Chiudi">✕</button>
        </div>
        <p className="modal-sub">a {c.name} · {c.city}</p>
        <label>Prodotto o materiale<input value={form.product} onChange={set("product")} placeholder="Es. filato di lino Nm 12" /></label>
        <label>Quantità indicativa<input value={form.quantity} onChange={set("quantity")} placeholder="Es. 500 kg / 1.000 paia" /></label>
        <label>Messaggio<textarea rows="3" value={form.message} onChange={set("message")} placeholder="Descrivi la tua esigenza…" /></label>
        <div className="two">
          <label>Il tuo nome<input value={form.contactName} onChange={set("contactName")} placeholder="Nome e cognome" /></label>
          <label>La tua email<input type="email" value={form.contactEmail} onChange={set("contactEmail")} placeholder="nome@azienda.it" /></label>
        </div>
        <button className="btn primary wide" disabled={!valid} onClick={() => onSubmit(form)}>Invia richiesta →</button>
      </div>
    </div>
  );
}

/* ---------------- Palette azienda (quadrati colore + chip Pantone-style) ---------------- */
function PaletteDots({ c, n = 5 }) {
  return (
    <span className="pal" aria-label="Cartella colori">
      {companyShades(c).slice(0, n).map((s) => (
        <i key={s.n} style={{ background: s.h }} title={s.n + " · " + s.p + " TCX"} />
      ))}
    </span>
  );
}

function ShadeChip({ s }) {
  return (
    <div className="shade">
      <div className="shade-sw" style={{ background: s.h }} />
      <span className="shade-n">{s.n}</span>
      <span className="shade-p">{s.p} TCX</span>
    </div>
  );
}

function Badge({ st }) {
  return (
    <span className={"badge " + st.key}>
      {st.key === "live" && <i className="pulse" aria-hidden="true" />}
      {st.label}
    </span>
  );
}

/* ---------------- Pagina Ricerca (intro + trend colori) ---------------- */
function SearchPage({ onSearch, onCategory }) {
  const [q, setQ] = useState("");
  const trends = useTrends();
  return (
    <main className="pg">
      <section className="pg-hero">
        <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Ricerca</p>
        <h1 className="page-h1">Trova il fornitore giusto,<br /><span className="accent">in poche parole.</span></h1>
        <p className="lead">
          Descrivi materiale, lavorazione o certificazione — "filato di lino GRS", "calze sportive",
          "stampa sublimatica". TEXA interpreta la richiesta, filtra {COMPANIES.length} fornitori
          verificati e li mostra su mappa, con contatti diretti e richiesta preventivo integrata.
        </p>
        <form className="searchbar" onSubmit={(e) => { e.preventDefault(); onSearch(q); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Linen yarn, seamless, GRS recycled…" aria-label="Search" />
          <button type="submit">Search →</button>
        </form>
        <div className="chips" aria-label="Categorie">
          {CATEGORIES.map((c) => (
            <button key={c} className="chip" onClick={() => onCategory(c)}>{c}</button>
          ))}
        </div>
      </section>

      <TrendColors trends={trends} />
    </main>
  );
}

function TrendColors({ trends }) {
  const maxF = Math.max(...trends.colors.map((c) => c.freq));
  return (
    <section className="trend">
      <div className="trend-head">
        <h2>Trend colori</h2>
        <span className="trend-season">
          {trends.label} · {trends.live ? "aggiornato in automatico sulla data di oggi" : "ultima stagione disponibile"}
        </span>
      </div>
      <div className="trend-grid">
        <div className="trend-hero">
          <div className="trend-hero-swatch" style={{ background: trends.hero.hex }} />
          <div className="trend-hero-info">
            <span className="trend-flag">Colore della stagione</span>
            <h3>{trends.hero.name}</h3>
            <span className="trend-code">PANTONE {trends.hero.pantone} TCX</span>
            <p>{trends.hero.note}</p>
          </div>
        </div>
        <div className="trend-list">
          <p className="trend-sub">I colori più ricorrenti su magazine e passerelle, con il riferimento Pantone più vicino.</p>
          {trends.colors.map((c) => (
            <div key={c.name} className="trend-row">
              <span className="trend-dot" style={{ background: c.hex }} />
              <span className="trend-name">{c.name}</span>
              <span className="trend-bar"><i style={{ width: (c.freq / maxF) * 100 + "%", background: c.hex }} /></span>
              <span className="trend-pant">{c.pantone} TCX</span>
            </div>
          ))}
          <p className="trend-src">Fonti: {trends.sources}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pagina Fiere internazionali ---------------- */
function FairsPage({ selected, setSelected }) {
  const now = new Date();
  const fairs = useMemo(() => sortFairs(FAIRS, now), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <main className="pg">
      <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Fiere internazionali</p>
      <h1 className="page-h1">Il calendario del tessile,<br /><span className="accent">sempre aggiornato.</span></h1>
      <p className="lead">
        Le fiere internazionali di filati, tessuti e tecnologia. Lo stato di ogni evento si aggiorna
        in automatico sulla data di oggi; l'ingresso si prenota tramite il sistema di registrazione
        ufficiale di ciascuna fiera.
      </p>

      <FairCalendar fairs={fairs} now={now} selected={selected} onPick={(id) => setSelected(id === selected ? null : id)} />

      <div className="fair-list">
        {fairs.map((f) => {
          const st = fairStatus(f, now);
          const open = selected === f.id;
          return (
            <article key={f.id} className={"fitem" + (st.key === "done" ? " done" : "")}>
              <button className="fitem-top" onClick={() => setSelected(open ? null : f.id)} aria-expanded={open}>
                <span className="fdate">{fmtRange(f)}</span>
                <span className="fname">{f.name}</span>
                <Badge st={st} />
                <span className="floc">{f.city}</span>
                <span className="row-arrow" aria-hidden="true">{open ? "↓" : "↗"}</span>
              </button>
              {open && (
                <div className="fdetail">
                  <p className="fdesc">{f.desc}</p>
                  <div className="fmeta">
                    <p><span className="k">Focus</span>{f.focus}</p>
                    <p><span className="k">Sede</span>{f.venue}, {f.city} · {f.country}</p>
                    <p><span className="k">Date</span>{fmtRange(f)}{st.key === "next" && st.days != null && <> · tra {st.days} giorni</>}</p>
                  </div>
                  {st.key !== "done" ? (
                    <a className="btn primary" href={f.url} target="_blank" rel="noreferrer">Prenota l'ingresso ↗</a>
                  ) : (
                    <a className="btn" href={f.url} target="_blank" rel="noreferrer">Sito ufficiale ↗</a>
                  )}
                  <p className="fnote">La prenotazione avviene sul sistema di registrazione ufficiale della fiera.</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}

function FairCalendar({ fairs, now, selected, onPick }) {
  const months = useMemo(() => {
    const keys = fairs.map((f) => f.start.slice(0, 7)).sort();
    let [y, m] = keys[0].split("-").map(Number);
    const [ly, lm] = keys[keys.length - 1].split("-").map(Number);
    const out = [];
    while (y < ly || (y === ly && m <= lm)) {
      out.push({ y, m });
      m++; if (m > 12) { m = 1; y++; }
    }
    return out;
  }, [fairs]);
  const curKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  return (
    <div className="cal" role="list" aria-label="Calendario degli eventi">
      {months.map(({ y, m }) => {
        const key = y + "-" + String(m).padStart(2, "0");
        const evs = fairs.filter((f) => f.start.slice(0, 7) === key);
        return (
          <div key={key} className={"cal-m" + (key === curKey ? " now" : "")} role="listitem">
            <span className="cal-lab">{MONTHS_IT[m - 1]} <em>{String(y).slice(2)}</em></span>
            <div className="cal-evs">
              {evs.map((f) => {
                const st = fairStatus(f, now);
                return (
                  <button key={f.id} className={"cal-ev " + st.key + (selected === f.id ? " sel" : "")}
                    onClick={() => onPick(f.id)} title={f.name + " · " + fmtRange(f)}>
                    {f.name.split(" ").slice(0, 2).join(" ")}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Messaggistica fornitori ---------------- */
function MessagesPage({ threads, activeId, setActiveId, onSend, onStart, onOpenCompany }) {
  const [tab, setTab] = useState("chat");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const active = threads.find((t) => t.companyId === activeId);
  const company = COMPANIES.find((c) => c.id === activeId);
  const matches = q
    ? COMPANIES.filter((c) => (c.name + " " + c.speciality + " " + c.city).toLowerCase().includes(q.toLowerCase()) && !threads.some((t) => t.companyId === c.id)).slice(0, 5)
    : [];

  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ block: "end" }); }, [threads, activeId, tab]);

  const send = () => {
    const t = draft.trim();
    if (!t || !company) return;
    onSend(company.id, t);
    setDraft("");
  };

  return (
    <main className="pg">
      <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Messaggi</p>
      <h1 className="page-h1">Filo diretto <span className="accent">coi fornitori.</span></h1>

      <div className="msg-grid">
        <aside className="msg-side">
          <input className="msg-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca un fornitore…" aria-label="Cerca fornitore" />
          {matches.length > 0 && (
            <div className="msg-new">
              {matches.map((c) => (
                <button key={c.id} onClick={() => { onStart(c.id); setQ(""); setTab("chat"); }}>
                  <span className="msg-name">{c.name}</span>
                  <PaletteDots c={c} n={4} />
                </button>
              ))}
            </div>
          )}
          {threads.map((t) => {
            const c = COMPANIES.find((x) => x.id === t.companyId);
            if (!c) return null;
            const last = t.msgs[t.msgs.length - 1];
            return (
              <button key={t.companyId} className={"msg-item" + (t.companyId === activeId ? " on" : "")}
                onClick={() => { setActiveId(t.companyId); setTab("chat"); }}>
                <span className="msg-item-top">
                  <span className="msg-name">{c.name}</span>
                  <PaletteDots c={c} n={4} />
                </span>
                <span className="msg-prev">{last ? last.text : "Nuova conversazione"}</span>
              </button>
            );
          })}
        </aside>

        {company && active ? (
          <section className="msg-chat">
            <div className="msg-head">
              <div>
                <h2>{company.name} <PaletteDots c={company} n={5} /></h2>
                <span className="msg-meta">{company.city} {company.province ? "(" + company.province + ")" : ""} · {company.category}</span>
              </div>
              <div className="msg-tabs" role="tablist">
                <button className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}>Chat</button>
                <button className={tab === "profilo" ? "on" : ""} onClick={() => setTab("profilo")}>Profilo</button>
                <button className={tab === "documenti" ? "on" : ""} onClick={() => setTab("documenti")}>Certificazioni & Doc</button>
              </div>
            </div>

            {tab === "chat" && (
              <>
                <div className="msg-scroll">
                  {active.msgs.length === 0 && <p className="msg-empty">Scrivi il primo messaggio a {company.name}.</p>}
                  {active.msgs.map((m) => (
                    <div key={m.id} className={"bubble " + m.from}>
                      <p>{m.text}</p>
                      <span>{m.at}</span>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <form className="msg-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={"Scrivi a " + company.name + "…"} aria-label="Messaggio" />
                  <button type="submit" disabled={!draft.trim()}>Invia →</button>
                </form>
              </>
            )}

            {tab === "profilo" && (
              <div className="msg-panel">
                <p className="msg-desc">{company.description}</p>
                <div className="fmeta">
                  <p><span className="k">Categoria</span>{company.category}</p>
                  <p><span className="k">Specialità</span>{company.speciality}</p>
                  <p><span className="k">Sede</span>{company.address ? company.address + ", " : ""}{company.city} {company.province ? "(" + company.province + ")" : ""} · {company.country}</p>
                  {company.website && <p><span className="k">Sito</span><a href={company.website} target="_blank" rel="noreferrer">{company.website.replace(/^https?:\/\//, "")}</a></p>}
                  {company.emails[0] && <p><span className="k">Email</span><a href={"mailto:" + company.emails[0]}>{company.emails[0]}</a></p>}
                </div>
                <div className="shade-row">{companyShades(company).map((s) => <ShadeChip key={s.n} s={s} />)}</div>
                <button className="btn" onClick={() => onOpenCompany(company.id)}>Scheda completa →</button>
              </div>
            )}

            {tab === "documenti" && (
              <div className="msg-panel">
                <h3 className="msg-h3">Certificazioni</h3>
                {company.certifications.length > 0 ? (
                  <div className="tagrow">
                    {company.certifications.map((cert) => (
                      <span key={cert} className="cert big">{cert}<small>{CERT_LABELS[cert] || ""}</small></span>
                    ))}
                  </div>
                ) : (
                  <p className="msg-note">Nessuna certificazione registrata su TEXA. Richiedile in chat: GOTS, OEKO-TEX, GRS, ISO…</p>
                )}
                <h3 className="msg-h3">Documentazione scaricabile</h3>
                <div className="docs">
                  {docsFor(company).map((d) => (
                    <button key={d.id} className="doc" onClick={() => download(d.file, d.make())}>
                      <span className="doc-ic" aria-hidden="true">↓</span>
                      <span className="doc-name">{d.label}</span>
                      <span className="doc-type">{d.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="msg-chat msg-none"><p>Seleziona una conversazione o cerca un fornitore.</p></section>
        )}
      </div>
    </main>
  );
}

/* ---------------- Styles ---------------- */
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@1,500;1,600&display=swap');
      :root{
        --bg:#FFFFFF; --card:#FAFAF8; --ink:#141414; --muted:#6E747B;
        --green:#0E7A4E; --green-dark:#0A5C3B; --green-soft:#EAF3EE; --line:#E9EAE6;
      }
      *{box-sizing:border-box;margin:0}
      ::selection{background:var(--green);color:#fff}
      .texa{min-height:100vh;background:var(--bg);color:var(--ink);
        font-family:'Inter',-apple-system,'SF Pro Text','Segoe UI',sans-serif;font-size:15px;line-height:1.6;
        -webkit-font-smoothing:antialiased;position:relative;overflow-x:hidden}
      button{font-family:inherit;cursor:pointer}
      a{color:var(--green);text-decoration:none}
      a:hover{text-decoration:underline}
      :focus-visible{outline:2px solid var(--green);outline-offset:2px;border-radius:4px}
      h1,h2,h3{font-weight:600;letter-spacing:-.02em}

      /* header */
      .hdr{display:flex;justify-content:space-between;align-items:center;
        padding:18px clamp(20px,5vw,64px);position:sticky;top:0;z-index:30;
        background:rgba(255,255,255,.85);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
      .logo{background:none;border:none;font-weight:600;font-size:18px;letter-spacing:.22em;color:var(--ink)}
      .rfq-pill{font-size:12px;font-weight:500;letter-spacing:.04em;color:var(--green-dark);
        background:var(--green-soft);padding:6px 13px;border-radius:100px}
      .nav{display:flex;gap:2px}
      .nav-l{background:none;border:none;font-size:14px;font-weight:500;color:var(--muted);
        padding:8px 14px;border-radius:100px;transition:all .15s}
      .nav-l:hover{color:var(--ink)}
      .nav-l.on{background:var(--green-soft);color:var(--green-dark)}

      /* hero */
      .hero{max-width:1000px;margin:0 auto;padding:clamp(64px,12vh,132px) clamp(20px,5vw,64px) 60px;text-align:left}
      .eyebrow{font-size:12px;font-weight:500;letter-spacing:.24em;text-transform:uppercase;
        color:var(--muted);margin-bottom:26px;display:flex;align-items:center;gap:10px}
      .tick{display:inline-block;color:var(--green);animation:spin 9s linear infinite;font-size:13px}
      @keyframes spin{to{transform:rotate(360deg)}}
      .mega{font-size:clamp(40px,7.4vw,84px);font-weight:600;letter-spacing:-.035em;line-height:1.04}
      .mega .line{display:block;animation:rise .7s cubic-bezier(.2,.8,.2,1) both}
      .mega .l2{animation-delay:.12s}
      .hollow,.accent{font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-style:italic;
        font-weight:500;color:var(--green);letter-spacing:-.01em}
      @keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}

      /* search */
      .searchbar{display:flex;align-items:stretch;max-width:620px;margin:44px 0 0;
        background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden;
        box-shadow:0 1px 2px rgba(20,20,20,.04);transition:border-color .2s,box-shadow .2s;
        animation:rise .7s .22s cubic-bezier(.2,.8,.2,1) both}
      .searchbar:focus-within{border-color:var(--green);box-shadow:0 0 0 4px var(--green-soft)}
      .searchbar input{flex:1;border:none;background:none;font:inherit;font-size:16px;
        color:var(--ink);outline:none;padding:16px 20px;min-width:0}
      .searchbar input::placeholder{color:#A6ABB1}
      .searchbar button{background:var(--ink);color:#fff;border:none;
        padding:0 26px;font-weight:500;font-size:15px;letter-spacing:.01em;transition:background .2s}
      .searchbar button:hover{background:var(--green)}
      .searchbar.compact{margin:6px auto 0;max-width:100%;animation:none}
      .hint{margin-top:16px;font-size:13.5px;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap;
        animation:rise .7s .3s both}
      .hint-link{background:none;border:1px solid var(--line);border-radius:100px;
        font:inherit;font-size:13px;color:var(--ink);padding:6px 14px;transition:all .15s}
      .hint-link:hover{border-color:var(--green);color:var(--green-dark);background:var(--green-soft)}

      /* marquee — doppia fascia nera a contrasto */
      .marquee{overflow:hidden;padding:14px 0;background:var(--ink)}
      .marquee-track{display:flex;gap:0;width:max-content;animation:scroll 32s linear infinite}
      .marquee.rev .marquee-track{animation-direction:reverse}
      .marquee:hover .marquee-track{animation-play-state:paused}
      .marquee-track span{font-weight:500;font-size:12.5px;color:#DDE0DA;
        letter-spacing:.18em;white-space:nowrap;display:flex;align-items:center}
      .marquee-track em{font-style:normal;color:#7CC99B;margin:0 22px;font-size:11px}
      @keyframes scroll{to{transform:translateX(-50%)}}

      /* hero art — rocche, filo e tessuto */
      .hero{position:relative}
      .hero .eyebrow,.hero .mega,.hero .searchbar,.hero .hint{position:relative;z-index:1}
      .hero-art{position:absolute;right:0;top:44px;width:min(40vw,440px);pointer-events:none;z-index:0}
      .hero-art svg{width:100%;height:auto;display:block}
      .thread{fill:none;stroke-dasharray:380;stroke-dashoffset:380;
        animation:draw 1.8s cubic-bezier(.4,0,.2,1) .5s forwards}
      .thread.t2{animation-delay:.85s}
      .thread.t3{animation-delay:1.2s}
      @keyframes draw{to{stroke-dashoffset:0}}
      .weft-l{transform-box:fill-box;transform-origin:left center;transform:scaleX(0);
        animation:weaveIn .55s cubic-bezier(.2,.8,.2,1) both}
      @keyframes weaveIn{to{transform:scaleX(1)}}
      .spool-in{animation:bob 7s ease-in-out infinite alternate}
      .sp2 .spool-in{animation-delay:1.4s}
      .sp3 .spool-in{animation-delay:2.6s}
      @keyframes bob{to{transform:translateY(7px)}}
      .tape{position:absolute;left:clamp(20px,5vw,64px);bottom:0;width:min(58%,560px);height:34px;
        opacity:.55;pointer-events:none;z-index:0;transform:rotate(-1.2deg)}
      @media(max-width:860px){.hero-art{display:none}}

      /* index */
      .index{max-width:1000px;margin:0 auto;padding:64px clamp(20px,5vw,64px) 8px}
      .index-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px}
      .index h2,.fairs h2,.trend-head h2{font-size:12px;font-weight:500;letter-spacing:.24em;text-transform:uppercase;color:var(--muted)}
      .index-sub{font-size:13px;color:var(--muted)}
      .row{display:flex;align-items:center;gap:16px;width:100%;text-align:left;
        background:none;border:none;border-top:1px solid var(--line);
        padding:22px 8px;transition:padding .2s, background .2s}
      .row:last-of-type{border-bottom:1px solid var(--line)}
      .row-name{font-size:clamp(18px,2.6vw,25px);font-weight:500;letter-spacing:-.02em;color:var(--ink)}
      .row-dots{flex:1;border-bottom:1px dotted var(--line);transform:translateY(4px)}
      .row-n{font-weight:500;font-size:14px;color:var(--muted)}
      .row-arrow{font-size:18px;color:var(--green);transform:translate(0,0);transition:transform .2s}
      .row:hover{background:var(--card);padding-left:18px;padding-right:18px}
      .row:hover .row-arrow{transform:translate(4px,-4px)}

      /* index → cartella colori multicolore */
      .cat-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-top:20px}
      .cat-card{position:relative;border:none;border-radius:18px;padding:26px 24px;min-height:150px;
        text-align:left;display:flex;flex-direction:column;justify-content:space-between;
        overflow:hidden;transition:transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s}
      .cat-card:hover{transform:translateY(-4px)}
      .cat-name{font-size:clamp(22px,2.6vw,29px);font-weight:600;letter-spacing:-.03em;line-height:1.05}
      .cat-specs{display:flex;flex-direction:column;gap:2px;font-size:11.5px;font-weight:500;
        letter-spacing:.02em;opacity:.82;font-variant-numeric:tabular-nums}
      .cat-arrow{margin-top:8px;font-size:12.5px;font-weight:600;letter-spacing:.02em;opacity:1}
      @media(max-width:560px){.cat-cards{grid-template-columns:1fr}}

      /* fairs (home) */
      .fairs{max-width:1000px;margin:0 auto;padding:56px clamp(20px,5vw,64px) 88px}
      .fair-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:16px}
      .fair-card{background:#fff;border:1px solid var(--line);border-radius:14px;
        padding:20px;display:flex;flex-direction:column;gap:5px;transition:all .18s;
        font:inherit;color:var(--ink);cursor:pointer;text-align:left}
      .fair-card:hover{border-color:#D8DBD5;transform:translateY(-2px);box-shadow:0 10px 28px rgba(20,20,20,.06)}
      .fair-name{font-weight:600;font-size:16.5px;letter-spacing:-.01em}
      .fair-meta{font-size:13.5px;color:var(--muted)}
      .fair-top{display:flex;justify-content:space-between;align-items:center;gap:8px}

      /* results */
      .res{padding:22px clamp(20px,5vw,64px) 72px;max-width:1280px;margin:0 auto}
      .chips{display:flex;gap:8px;overflow-x:auto;padding:16px 0 4px;scrollbar-width:none}
      .chips::-webkit-scrollbar{display:none}
      .chip{white-space:nowrap;background:none;border:1px solid var(--line);
        border-radius:100px;padding:7px 16px;font-size:13px;font-weight:500;color:var(--ink);transition:all .15s}
      .chip:hover{border-color:var(--green);color:var(--green-dark)}
      .chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
      .ai-note{display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--muted);margin-top:10px}
      .ai-dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px var(--green-soft);flex:none}
      .res-grid{display:grid;grid-template-columns:1fr 420px;gap:26px;margin-top:20px;align-items:start}
      .res-count{font-size:13px;color:var(--muted);margin-bottom:12px}
      .res-list{display:flex;flex-direction:column;gap:12px}
      .card{background:#fff;border:1px solid var(--line);border-radius:16px;
        padding:18px 20px;cursor:pointer;transition:all .16s}
      .card:hover,.card.hl{border-color:#D8DBD5;transform:translateY(-2px);box-shadow:0 10px 28px rgba(20,20,20,.07)}
      .card-top{display:flex;align-items:center;gap:10px}
      .card h3{font-size:16.5px;font-weight:600;letter-spacing:-.015em;flex:1;min-width:0}
      .card-arrow{color:var(--green);font-size:17px;opacity:0;transform:translate(-4px,4px);transition:all .18s}
      .card:hover .card-arrow,.card.hl .card-arrow{opacity:1;transform:translate(0,0)}
      .card-desc{font-size:13.5px;color:var(--muted);margin-top:6px;display:-webkit-box;
        -webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .card-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:13px;font-size:12.5px}
      .pill{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;
        color:var(--green-dark);background:var(--green-soft);padding:4px 10px;border-radius:100px;white-space:nowrap}
      .loc{color:var(--ink);font-weight:500}
      .cert{font-size:11px;font-weight:600;letter-spacing:.05em;color:var(--green-dark);
        border:1px solid #CBE2D6;background:#fff;padding:4px 9px;border-radius:6px}
      .empty{background:var(--card);border:1px dashed var(--line);border-radius:16px;padding:36px 24px;text-align:center}
      .empty-sub{font-size:13.5px;color:var(--muted);margin-top:6px}

      /* map */
      .res-map{position:sticky;top:88px}
      .mapwrap{background:#fff;border:1px solid var(--line);border-radius:16px;
        overflow:hidden;position:relative}
      .leaflet-box{width:100%;height:520px}
      .svgmap{display:block;width:100%;height:auto}
      .pin{cursor:pointer}
      .map-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        font-size:13px;color:var(--muted);background:#fff}
      .lpin{width:13px;height:13px;border-radius:50%;background:var(--ink);border:2.5px solid #fff;
        box-shadow:0 0 0 1px var(--line);transition:all .15s;cursor:pointer}
      .lpin.on{background:var(--green);transform:scale(1.5);box-shadow:0 0 0 1px var(--green)}
      .ltip{font-family:'Inter';font-size:12px;font-weight:500;background:var(--ink)!important;
        color:#fff!important;border:none!important;border-radius:8px!important;
        box-shadow:none!important;padding:5px 10px!important}
      .ltip::before{display:none}
      .abroad{font-size:12.5px;color:var(--muted);margin-top:10px;padding:0 4px}

      /* company */
      .co{padding:24px clamp(20px,5vw,64px) 88px;max-width:900px;margin:0 auto;animation:rise .4s ease both}
      .back{background:none;border:none;font-size:14px;font-weight:500;color:var(--muted);padding:6px 0;margin-bottom:14px}
      .back:hover{color:var(--green)}
      .co-hero{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
      .mono{width:72px;height:72px;flex:none;border-radius:16px;background:var(--green-soft);color:var(--green-dark);
        display:flex;align-items:center;justify-content:center;font-weight:600;font-size:24px;letter-spacing:.02em}
      .co-id{flex:1;min-width:230px}
      .co-id h1{font-size:clamp(24px,3.6vw,34px);font-weight:600;letter-spacing:-.025em;margin:10px 0 6px}
      .co-name{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
      .co-loc{font-size:13.5px;color:var(--muted)}
      .co-cta{display:flex;gap:10px;flex-wrap:wrap}
      .btn{border:1px solid #D9DBD6;background:#fff;color:var(--ink);border-radius:100px;
        padding:11px 22px;font-weight:500;font-size:14px;transition:all .15s}
      .btn:hover{border-color:var(--ink)}
      .btn.primary{background:var(--ink);border-color:var(--ink);color:#fff}
      .btn.primary:hover{background:var(--green);border-color:var(--green)}
      .btn:disabled{opacity:.4;cursor:not-allowed}
      .btn.wide{width:100%;margin-top:6px;border-radius:14px}
      .ok{margin-top:20px;background:var(--green-soft);border:1px solid #CBE2D6;color:var(--green-dark);
        border-radius:12px;padding:14px 18px;font-size:14px;font-weight:500}
      .contact-panel{margin-top:20px;background:var(--card);border:1px solid var(--line);
        border-radius:16px;padding:20px 22px;display:flex;flex-direction:column;gap:10px;font-size:14.5px}
      .contact-panel .k{display:inline-block;width:86px;font-size:11px;font-weight:600;
        letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
      .contact-panel a{margin-right:14px;word-break:break-all}
      .co-sec{margin-top:52px}
      .co-sec h2{font-size:12px;font-weight:500;letter-spacing:.24em;text-transform:uppercase;
        color:var(--muted);margin-bottom:14px}
      .co-desc{font-size:15px;max-width:640px}
      .tagrow{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
      .tag{font-size:13px;font-weight:500;background:none;border:1px solid var(--line);
        padding:6px 14px;border-radius:100px;color:var(--ink)}
      .cert.big{display:inline-flex;flex-direction:column;gap:2px;font-size:13px;padding:12px 16px;
        border-radius:12px;background:var(--green-soft);border:none}
      .cert.big small{font-size:11px;font-weight:500;letter-spacing:0;text-transform:none;color:var(--muted)}
      .prods{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
      .prod{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;
        display:flex;flex-direction:column;transition:all .16s}
      .prod:hover{border-color:#D8DBD5;transform:translateY(-2px);box-shadow:0 8px 20px rgba(20,20,20,.06)}
      .prod-swatch{height:86px}
      .prod-name{font-size:13.5px;font-weight:600;padding:10px 12px 2px;letter-spacing:-.01em}
      .prod-meta{font-size:11.5px;color:var(--muted);padding:0 12px 12px}

      /* modal */
      .overlay{position:fixed;inset:0;background:rgba(20,20,20,.35);backdrop-filter:blur(4px);
        display:flex;align-items:center;justify-content:center;padding:20px;z-index:50;animation:fade .2s ease}
      @keyframes fade{from{opacity:0}}
      .modal{background:#fff;border:1px solid var(--line);border-radius:20px;padding:26px;
        width:100%;max-width:440px;max-height:90vh;overflow-y:auto;
        box-shadow:0 24px 64px rgba(20,20,20,.16);animation:rise .3s ease}
      .modal-top{display:flex;justify-content:space-between;align-items:center}
      .modal h3{font-size:19px;font-weight:600;letter-spacing:-.02em}
      .x{background:none;border:none;font-size:15px;color:var(--muted);padding:6px}
      .modal-sub{font-size:13.5px;color:var(--muted);margin:2px 0 18px}
      .modal label{display:flex;flex-direction:column;gap:6px;font-size:11.5px;font-weight:600;
        color:var(--muted);margin-bottom:14px;letter-spacing:.08em;text-transform:uppercase}
      .modal input,.modal textarea{border:1px solid var(--line);border-radius:12px;background:#fff;
        padding:11px 14px;font:inherit;font-size:14.5px;font-weight:400;color:var(--ink);outline:none;
        transition:border-color .15s,box-shadow .15s;resize:vertical;text-transform:none;letter-spacing:0}
      .modal input:focus,.modal textarea:focus{border-color:var(--green);box-shadow:0 0 0 3px var(--green-soft)}
      .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}

      /* footer */
      .foot{border-top:1px solid var(--line);background:var(--bg);color:var(--muted);overflow:hidden}
      .foot-giant{font-size:clamp(90px,22vw,300px);font-weight:600;letter-spacing:.02em;line-height:.78;
        color:#F3F4F1;text-align:center;transform:translateY(14%);user-select:none}
      .foot-row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;
        padding:18px clamp(20px,5vw,64px) 22px;font-size:12.5px;border-top:1px solid var(--line)}

      /* pagine sezione */
      .pg{padding:56px clamp(20px,5vw,64px) 96px;max-width:1000px;margin:0 auto}
      .page-h1{font-size:clamp(30px,4.8vw,52px);font-weight:600;letter-spacing:-.03em;
        line-height:1.08;margin-bottom:18px;animation:rise .6s cubic-bezier(.2,.8,.2,1) both}
      .lead{max-width:620px;font-size:15.5px;color:var(--muted);margin-bottom:30px;animation:rise .6s .08s both}
      .pg .searchbar{margin-top:4px}
      .pg .chips{padding:16px 0 0}
      .see-all{background:none;border:none;font-size:13px;font-weight:500;color:var(--green);padding:0}
      .see-all:hover{text-decoration:underline}

      /* palette azienda */
      .pal{display:inline-flex;gap:3px;align-items:center;flex:none}
      .pal i{width:11px;height:11px;border-radius:3px;border:1px solid rgba(20,20,20,.1)}
      .co-name .pal i{width:14px;height:14px;border-radius:4px}
      .shade-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:12px;margin-top:16px;width:100%}
      .shade{background:#fff;border:1px solid var(--line);border-radius:10px;padding:7px 8px 10px;
        display:flex;flex-direction:column;gap:2px;box-shadow:0 1px 2px rgba(20,20,20,.04)}
      .shade-sw{height:64px;border-radius:6px;margin-bottom:6px;border:1px solid rgba(20,20,20,.06)}
      .shade-n{font-size:12px;font-weight:600;letter-spacing:-.01em}
      .shade-p{font-size:10px;color:var(--muted);letter-spacing:.05em;text-transform:uppercase}

      /* badge stato fiera */
      .badge{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;
        letter-spacing:.07em;text-transform:uppercase;padding:4px 10px;border-radius:100px;white-space:nowrap;flex:none}
      .badge.live{background:var(--green-soft);color:var(--green-dark)}
      .badge.next{border:1px solid #D9DBD6;color:var(--ink)}
      .badge.done{border:1px solid var(--line);color:var(--muted)}
      .pulse{width:6px;height:6px;border-radius:50%;background:var(--green);animation:blink 1.6s ease infinite}
      @keyframes blink{50%{opacity:.3}}

      /* trend colori */
      .trend{margin-top:72px}
      .trend-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap}
      .trend-season{font-size:13px;color:var(--muted)}
      .trend-grid{display:grid;grid-template-columns:330px 1fr;gap:20px;align-items:start}
      .trend-hero{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;animation:rise .5s .1s both}
      .trend-hero-swatch{height:190px;border-bottom:1px solid var(--line)}
      .trend-hero-info{padding:18px 20px 22px}
      .trend-flag{font-size:10.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--green)}
      .trend-hero-info h3{font-size:23px;font-weight:600;letter-spacing:-.02em;margin:6px 0 2px}
      .trend-code{font-size:12px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
      .trend-hero-info p{font-size:13.5px;color:var(--muted);margin-top:10px}
      .trend-list{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:20px 22px;animation:rise .5s .16s both}
      .trend-sub{font-size:13.5px;color:var(--muted);margin-bottom:12px}
      .trend-row{display:flex;align-items:center;gap:12px;padding:9px 0;border-top:1px solid var(--line)}
      .trend-dot{width:26px;height:26px;border-radius:8px;flex:none;border:1px solid rgba(20,20,20,.08)}
      .trend-name{font-weight:500;font-size:14px;width:126px;flex:none}
      .trend-bar{flex:1;height:8px;background:#EFF0ED;border-radius:100px;overflow:hidden}
      .trend-bar i{display:block;height:100%;border-radius:100px;transition:width .6s cubic-bezier(.2,.8,.2,1)}
      .trend-pant{font-size:11px;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;width:92px;text-align:right;flex:none}
      .trend-src{font-size:12px;color:var(--muted);margin-top:14px}

      /* calendario fiere */
      .cal{display:flex;gap:10px;overflow-x:auto;padding:6px 2px 16px;margin-bottom:32px;scrollbar-width:thin}
      .cal-m{min-width:116px;flex:none;background:#fff;border:1px solid var(--line);
        border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px}
      .cal-m.now{border-color:var(--green);box-shadow:0 0 0 3px var(--green-soft)}
      .cal-lab{font-weight:600;font-size:12.5px;text-transform:uppercase;letter-spacing:.08em}
      .cal-lab em{font-style:normal;color:var(--muted)}
      .cal-evs{display:flex;flex-direction:column;gap:5px;min-height:27px}
      .cal-ev{border:none;border-radius:8px;font-size:11.5px;font-weight:500;padding:5px 9px;
        text-align:left;background:#F2F3F0;color:var(--ink);transition:all .15s;white-space:nowrap;
        overflow:hidden;text-overflow:ellipsis;max-width:150px}
      .cal-ev.live{background:var(--green);color:#fff}
      .cal-ev.done{background:#F5F5F3;color:var(--muted)}
      .cal-ev:hover,.cal-ev.sel{outline:1.5px solid var(--green)}

      /* elenco fiere */
      .fair-list{display:flex;flex-direction:column}
      .fitem{border-top:1px solid var(--line)}
      .fitem:last-child{border-bottom:1px solid var(--line)}
      .fitem-top{display:flex;align-items:center;gap:14px;width:100%;background:none;border:none;
        padding:20px 8px;text-align:left;transition:background .15s;flex-wrap:wrap}
      .fitem-top:hover{background:var(--card)}
      .fdate{font-size:12.5px;color:var(--muted);width:128px;flex:none;font-weight:500}
      .fname{font-weight:600;font-size:clamp(15.5px,2.1vw,18px);letter-spacing:-.015em;flex:1;min-width:150px;color:var(--ink)}
      .fitem.done .fname{color:var(--muted);font-weight:500}
      .floc{font-size:13px;color:var(--muted)}
      .fdetail{padding:4px 8px 28px;animation:rise .3s ease both}
      .fdesc{font-size:14.5px;max-width:620px;margin-bottom:16px}
      .fmeta{display:flex;flex-direction:column;gap:6px;font-size:14px;margin-bottom:18px}
      .fmeta .k{display:inline-block;width:86px;font-size:11px;font-weight:600;letter-spacing:.12em;
        text-transform:uppercase;color:var(--muted)}
      .fdetail .btn{display:inline-block;text-decoration:none}
      .fdetail .btn:hover{text-decoration:none}
      .fnote{font-size:12px;color:var(--muted);margin-top:12px}

      /* messaggi */
      .msg-grid{display:grid;grid-template-columns:320px 1fr;gap:20px;align-items:start;margin-top:18px}
      .msg-side{display:flex;flex-direction:column;gap:8px}
      .msg-search{border:1px solid var(--line);border-radius:12px;background:#fff;
        padding:11px 14px;font:inherit;font-size:14px;color:var(--ink);outline:none;transition:all .15s}
      .msg-search:focus{border-color:var(--green);box-shadow:0 0 0 3px var(--green-soft)}
      .msg-new{display:flex;flex-direction:column;gap:4px;border:1px dashed var(--green);border-radius:12px;padding:6px}
      .msg-new button{display:flex;justify-content:space-between;align-items:center;gap:8px;background:none;
        border:none;padding:9px 10px;border-radius:8px;text-align:left;font-size:13px;font-weight:500;color:var(--ink)}
      .msg-new button:hover{background:var(--green-soft)}
      .msg-item{display:flex;flex-direction:column;gap:5px;background:#fff;border:1px solid var(--line);
        border-radius:14px;padding:13px 14px;text-align:left;transition:all .15s;width:100%}
      .msg-item:hover{border-color:#D8DBD5}
      .msg-item.on{border-color:var(--green);box-shadow:0 0 0 3px var(--green-soft)}
      .msg-item-top{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%}
      .msg-name{font-weight:600;font-size:13.5px;letter-spacing:-.01em;color:var(--ink);
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .msg-prev{font-size:12.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
      .msg-chat{background:#fff;border:1px solid var(--line);border-radius:18px;
        display:flex;flex-direction:column;min-height:560px;overflow:hidden;box-shadow:0 1px 2px rgba(20,20,20,.03)}
      .msg-none{align-items:center;justify-content:center;color:var(--muted);font-size:14px}
      .msg-head{padding:16px 20px;border-bottom:1px solid var(--line);display:flex;
        justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center}
      .msg-head h2{font-size:15.5px;font-weight:600;letter-spacing:-.01em;
        display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .msg-meta{font-size:12px;color:var(--muted)}
      .msg-tabs{display:flex;gap:6px;flex-wrap:wrap}
      .msg-tabs button{background:none;border:1px solid var(--line);border-radius:100px;
        font-size:12px;font-weight:500;color:var(--ink);padding:6px 13px;transition:all .15s}
      .msg-tabs button:hover{border-color:var(--green);color:var(--green-dark)}
      .msg-tabs button.on{background:var(--green-soft);border-color:var(--green-soft);color:var(--green-dark)}
      .msg-scroll{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:10px;max-height:430px}
      .bubble{max-width:75%;padding:10px 14px;border-radius:16px;font-size:14px;animation:rise .25s ease both}
      .bubble.me{align-self:flex-end;background:var(--green);color:#fff;border-bottom-right-radius:4px}
      .bubble.sup{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:4px}
      .bubble span{display:block;font-size:10.5px;opacity:.6;margin-top:4px}
      .msg-empty{font-size:13.5px;color:var(--muted);text-align:center;margin:auto}
      .msg-input{display:flex;gap:8px;padding:14px;border-top:1px solid var(--line)}
      .msg-input input{flex:1;border:1px solid var(--line);border-radius:100px;background:#fff;
        padding:11px 18px;font:inherit;font-size:14px;color:var(--ink);outline:none;min-width:0;transition:all .15s}
      .msg-input input:focus{border-color:var(--green);box-shadow:0 0 0 3px var(--green-soft)}
      .msg-input button{background:var(--ink);color:#fff;border:none;border-radius:100px;
        padding:0 20px;font-weight:500;font-size:14px;transition:background .2s}
      .msg-input button:disabled{opacity:.35;cursor:not-allowed}
      .msg-input button:not(:disabled):hover{background:var(--green)}
      .msg-panel{padding:22px;display:flex;flex-direction:column;gap:16px;align-items:flex-start;overflow-y:auto}
      .msg-desc{font-size:14.5px;max-width:560px}
      .msg-h3{font-size:11.5px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
      .msg-note{font-size:13.5px;color:var(--muted)}
      .docs{display:flex;flex-direction:column;gap:8px;width:100%;max-width:440px}
      .doc{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);
        border-radius:12px;padding:12px 14px;text-align:left;transition:all .15s;font-size:13.5px;color:var(--ink)}
      .doc:hover{border-color:var(--green);box-shadow:0 4px 14px rgba(20,20,20,.05)}
      .doc-ic{width:26px;height:26px;border-radius:8px;background:var(--green-soft);color:var(--green-dark);
        display:flex;align-items:center;justify-content:center;font-weight:600;flex:none}
      .doc-name{flex:1;font-weight:500}
      .doc-type{font-size:10.5px;font-weight:600;letter-spacing:.08em;color:var(--muted)}

      /* responsive */
      @media(max-width:920px){
        .res-grid{grid-template-columns:1fr}
        .res-map{position:static;order:-1}
        .leaflet-box{height:340px}
        .trend-grid{grid-template-columns:1fr}
        .msg-grid{grid-template-columns:1fr}
        .msg-chat{min-height:480px}
        .fdate{width:auto;order:3}
      }
      @media(max-width:560px){
        .two{grid-template-columns:1fr}
        .searchbar button{padding:0 18px}
        .nav-l{padding:7px 9px;font-size:13px}
        .hdr{padding:16px 20px}
        .trend-name{width:96px}
        .trend-pant{display:none}
        .card-top .pal{display:none}
      }
      @media(prefers-reduced-motion:reduce){
        *,*::before,*::after{animation:none!important;transition:none!important}
      }
    `}</style>
  );
}
