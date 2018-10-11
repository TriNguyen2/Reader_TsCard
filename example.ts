import { TsCard } from './index';
import Reader, { ApduResponse } from './reader';
import SmartCard from './cards/smartcard';
import { Sle } from './cards/memorycard';
import Utilities from './utilities';

class Example {
    static async main() {

        console.log("Example started...");
        let tsPcsc = TsCard.instance;
        console.log("Waiting for reader plugged...");

        //TsCard.rawDemo();
        //return;

        try {

            let cardReader : Reader = await tsPcsc.detectReader(15000);
            if (cardReader != null) {

                console.log(`Reader detected:${cardReader.name}`);

                let cardInfo : [boolean , SmartCard?] = await tsPcsc.insertCard(15000);
                if (cardInfo[0]){

                    let atrHex : string = "";
                    cardInfo[1].atr.map(val => {
                        atrHex += val.toString(16);
                    });
                    console.log(`Smartcard inserted:${cardInfo["0"]}\nSmartCard ATR: ${Utilities.BytesToHexString(cardInfo[1].atr)}`);
                    
                    console.log(`Is SmartCard Object? ${cardInfo[1] instanceof SmartCard}`);
                    console.log(`Is Sle Object? ${cardInfo[1] instanceof Sle}`);
                    console.log(`Is Memory Card:${cardInfo[1].isMemoryCard}`)
                }
                    
                else
                    console.log(`Smartcard inserted:${cardInfo["0"]}`);

                if (!cardInfo[1].isMemoryCard) {

                    console.log("Read MasterFile DF...");
                    let apduResult : ApduResponse = await cardReader.sendApdu(
                        cardInfo[1],
                        {
                            Cla: 0x00,
                            Ins: 0xA4,
                            P1: 0x00,
                            P2: 0x00,
                            Le: 80,
                            Lc: 0x02
                        },
                        [ 0x3F, 0x00]
                    );
                    console.log(`SW: ${apduResult.SW}\nData Received: ${apduResult.Data}`);
                } else {

                    if (cardInfo[1] instanceof Sle){

                        let mySle : Sle = cardInfo[1];
                        let retRead = await mySle.readBytes(32,10);
                    }
                }
            }
        }
        catch (error) {
            console.log(`Error!\n${error}`)
        }
        finally {

            tsPcsc.close();
            console.log("Example completed...");    
        }
        
        console.log("Reader closed");
    }
}

Example.main();
