import { AppDataSource } from "./data-source"
import { Contact } from "./entity/Contact"
import express from "express";
import * as _ from "lodash";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from './swagger.json';


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
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
app.post("/identity", async (req, res) => {
    //console.log("Received request to process identity", req.body);
    if (!req.body || (!req.body.email && !req.body.phoneNumber)) {
        return res.status(400).json({ message: "Request body must include at least 'email' or 'phoneNumber'" });
    }
    const {email,phoneNumber}=req.body;
    const contacts = await AppDataSource
        .getRepository(Contact)
        .createQueryBuilder("contact")
        .where("contact.email = :email or contact.phoneNumber = :phoneNumber", { email, phoneNumber })
        .andWhere('"contact"."deletedAt" IS NULL')
        .getMany();
    //console.log("Found contacts:", contacts);
    const allPrimary = _.filter(contacts, { linkPrecedence: "primary" });
    //console.log("All primary contacts:", allPrimary);
    const primaryId = allPrimary.length>0 ? allPrimary[0].id : (contacts.length>0)? contacts[0].linkedId : null;
    if(allPrimary.length > 1) {
        //console.log("Linked Ids:",{ ids: allPrimary.filter((_: Contact, index: number) => index != 0).map((c: Contact) => c.id) });
        // then update all other primary and primary children to secondary with the linkedId of the first primary
        await AppDataSource.createQueryBuilder()
            .update(Contact)
            .set({ linkPrecedence: "secondary", linkedId: primaryId })
            .where("id IN (:...ids) or linkedId IN (:...ids)", { ids: allPrimary.filter((_: Contact, index: number) => index != 0).map((c: Contact) => c.id) })
            .andWhere('"contact"."deletedAt" IS NULL')
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
            .andWhere('"contact"."deletedAt" IS NULL')
            .getMany();
    }
    else {
        updatedData = await AppDataSource
            .getRepository(Contact)
            .createQueryBuilder("contact")
            .where(`contact.email = :email or contact.phoneNumber = :phoneNumber or contact.linkedId = :primaryId`, { email, phoneNumber, primaryId })
            .andWhere('"contact"."deletedAt" IS NULL')
            .getMany();
    }

    const transformedData = transformContactData(updatedData);
    res.status(200).json(transformedData);
});

function transformContactData(rawData) {
  const primaryContact = rawData.find(contact => contact.linkPrecedence === 'primary');

  const sortedContacts = _.sortBy(rawData, c => c.linkPrecedence === 'primary' ? 0 : 1);

  const emails = _.uniq([
    primaryContact.email,
    ...sortedContacts
      .filter(c => c.id !== primaryContact.id)
      .map(c => c.email)
  ].filter(Boolean));

  const phoneNumbers = _.uniq([
    primaryContact.phoneNumber,
    ...sortedContacts
      .filter(c => c.id !== primaryContact.id)
      .map(c => c.phoneNumber)
  ].filter(Boolean));

  const secondaryContactIds = sortedContacts
    .filter(c => c.linkPrecedence === 'secondary')
    .map(c => c.id);

  return {
    contact: {
      primaryContatctId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds
    }
  };
}
