
var darFile = ".daml/dist/daml-chat-app-0.0.1.dar"

all_participants upload_dar darFile

import com.digitalasset.canton.console.ParticipantReference
def export_parties(ref: ParticipantReference, filename: String) = {
  import com.digitalasset.canton.identity.UniqueIdentifier
  case class MyParty(displayName: String, isLocal: Boolean, partyId: String)
  case class MyResult(result: Seq[MyParty], status: Int = 200)
  val Some(myId) = ref.get_id()
  val res = ref.list_parties().filter(x => x.party != x.participant).map { x =>
    val uid = UniqueIdentifier.tryFromString(x.party)
    MyParty(uid.id.str, x.participant == myId, x.party)
  }
  import java.io._
  val bw = new BufferedWriter(new FileWriter(filename))
  import io.circe._, io.circe.generic.auto._, io.circe.parser._, io.circe.syntax._
  bw.write(MyResult(res).asJson.noSpaces)
  bw.close()
}

import java.io.File

(new File("live-stubs").mkdirs())

export_parties(all_participants.head, "live-stubs/parties.json")

