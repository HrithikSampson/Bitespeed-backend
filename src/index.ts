import { AppDataSource } from "./data-source"
import { Contact } from "./entity/Contact"
import * as express from "express";
import * as _ from "lodash";


AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
app.post("/identity", async (req, res) => {
    console.log("Received request to process identity", req.body);
    if (!req.body || (!req.body.email && !req.body.phoneNumber)) {
        return res.status(400).json({ message: "Request body must include at least 'email' or 'phoneNumber'" });
    }
    const {email,phoneNumber}=req.body;
    const contacts = await AppDataSource
        .getRepository(Contact)
        .createQueryBuilder("contact")
        .where("contact.email = :email or contact.phoneNumber = :phoneNumber", { email, phoneNumber })
        .getMany();
    console.log("Found contacts:", contacts);
    const allPrimary = _.filter(contacts, { linkPrecedence: "primary" });
    const primaryId = allPrimary.length>0 ? allPrimary[0].id : (contacts.length>0)? contacts[0].linkedId : null;
    if(allPrimary.length > 1) {
        // then update all other primary and primary children to secondary with the linkedId of the first primary
        await AppDataSource.createQueryBuilder()
            .update(Contact)
            .set({ linkPrecedence: "secondary" })
            .set({ linkedId: primaryId })
            .where("id IN (:...ids) or linkedId IN (:...ids)", { ids: allPrimary.filter((_: Contact, index: number) => index != 0).map((c: Contact) => c.id) })
            .execute();
    }

    await AppDataSource.createQueryBuilder()
        .insert()
        .into(Contact)
        .values({
            email,
            phoneNumber,
            linkPrecedence: primaryId?"secondary":"primary",
            linkedId: primaryId
        })
        .execute();
    let updatedData: Contact[] = [];
    if(primaryId === null) {
        updatedData = await AppDataSource
            .getRepository(Contact)
            .createQueryBuilder("contact")
            .where(`contact.email = :email or contact.phoneNumber = :phoneNumber`, { email, phoneNumber })
            .getMany();
    }
    else {
        updatedData = await AppDataSource
            .getRepository(Contact)
            .createQueryBuilder("contact")
            .where(`contact.email = :email or contact.phoneNumber = :phoneNumber or contact.linkedId = :primaryId`, { email, phoneNumber, primaryId })
            .getMany();
    }
    
    res.status(200).json({ message: "Identity processed successfully", data: updatedData });
});
