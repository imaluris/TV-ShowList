import Section from "../ui/Section";
import Rail from "../ui/Rail";
import ShowCard from "./ShowCard";

// Riga di locandine con titolo: usata in Home, piattaforme e dettagli.
function ShowRow({ title, shows }) {
  if (!shows || shows.length === 0) {
    return null;
  }

  return (
    <Section title={title}>
      <Rail>
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </Rail>
    </Section>
  );
}

export default ShowRow;
