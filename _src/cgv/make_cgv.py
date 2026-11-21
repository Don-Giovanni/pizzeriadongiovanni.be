# Conditions générales de vente (CGV) di New Don Giovanni SRL, 18.11.2026. Uso: python3 make_cgv.py cgv.pdf x  (il 2° argomento non si usa più)
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
import sys

out = sys.argv[1]
version = sys.argv[2]

title = ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=16, leading=20, spaceAfter=2)
sub = ParagraphStyle("s", fontName="Helvetica", fontSize=9, leading=12, textColor=colors.HexColor("#444444"))
h = ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=10.5, leading=13, spaceBefore=7, spaceAfter=2)
b = ParagraphStyle("b", fontName="Helvetica", fontSize=9.5, leading=12.6, alignment=0)

arts = [
("1. Champ d'application",
 "Les présentes conditions s'appliquent à toute commande faisant l'objet d'un devis ou d'une facture. "
 "Elles sont acceptées par la signature du devis, par la confirmation de la commande par e-mail ou par le paiement de la facture. "
 "Une confirmation par e-mail vaut accord. Elles priment sur les conditions du client, sauf accord écrit signé par les deux parties. "
 "Lorsque des règles impératives s'appliquent au client, notamment aux consommateurs ou aux pouvoirs publics, elles priment sur les présentes conditions. "
 "Le droit de rétractation ne s'applique pas aux services de restauration prévus à une date déterminée."),
("2. Devis et commandes",
 "Le devis est valable un mois à compter de sa date, et au plus tard jusqu'à 72 heures avant la date de l'événement. "
 "Passé ce délai sans confirmation, le devis est caduc. La commande est confirmée à la réception du devis signé et du paiement d'un acompte de 30 % "
 "du montant de la commande. En cas d'annulation jusqu'à 72 heures avant la date de l'événement, l'acompte est remboursé. "
 "Passé ce délai, l'acompte reste acquis à titre d'indemnité."),
("3. Prix",
 "Les prix s'entendent en euros, TVA comprise aux taux légaux. Les frais de livraison sont ceux indiqués sur le devis ou la facture. "
 "Une erreur manifeste de prix ou de frappe peut être corrigée. Les photos sont non contractuelles."),
("4. Livraison",
 "La livraison a lieu à l'adresse, à la date et à l'heure convenues. Le client ou son représentant doit être présent. "
 "Les risques sont transférés au client à la livraison. En cas de force majeure (trafic, intempéries, panne), "
 "un nouvel horaire ou l'annulation est convenu, sans indemnité."),
("5. Réclamations",
 "Toute réclamation doit être faite au moment de la livraison ou au plus tard le jour même. "
 "Les denrées alimentaires ne sont ni reprises ni échangées."),
("6. Allergènes",
 "La liste des allergènes est disponible sur notre site et sur demande. Le client nous informe à l'avance de toute allergie."),
("7. Paiement",
 "Les factures sont payables dans les 30 jours de leur date, par virement avec la communication structurée indiquée. "
 "En cas de retard, le montant dû est majoré de plein droit, sans mise en demeure préalable, d'une indemnité forfaitaire de 10 % "
 "du montant dû, avec un minimum de 50 € pour les factures jusqu'à 200 € et de 75 € pour les factures supérieures à 200 €, "
 "ainsi que d'intérêts de retard au taux légal (loi du 2 août 2002). Toutes les autres factures deviennent alors immédiatement "
 "exigibles, et nous pouvons suspendre ou refuser toute nouvelle commande. Un premier rappel est envoyé après l'échéance, "
 "un second un mois plus tard ; le dossier est ensuite transmis au recouvrement."),
("8. Responsabilité",
 "Notre responsabilité est limitée au montant de la commande concernée, sauf en cas de dol ou de faute grave. "
 "Les dommages indirects, tels que la perte de bénéfice, sont exclus."),
("9. Données personnelles",
 "Les données du client sont traitées selon notre politique de confidentialité, disponible sur pizzeriadongiovanni.be."),
("10. Litiges",
 "Les parties cherchent d'abord une solution amiable. À défaut, le droit belge s'applique et les tribunaux de Charleroi "
 "sont seuls compétents."),
("11. Version",
 "La version applicable est celle en vigueur à la date du devis ou de la facture."),
]

def footer(c, d):
    c.saveState()
    c.setFont("Helvetica", 7.5)
    c.setFillColor(colors.HexColor("#555555"))
    c.drawCentredString(A4[0]/2, 10*mm,
        "New Don Giovanni SRL · Grand'Rue 1, 6530 Thuin")  # 21.11.2026 (titolare): senza email né telefono
    c.restoreState()

doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm, bottomMargin=22*mm,
                        title="Conditions générales de vente – New Don Giovanni SRL", author="New Don Giovanni SRL")
story = [Paragraph("Conditions générales de vente", title),
         Spacer(1, 6)]
for t, x in arts:
    story += [Paragraph(t, h), Paragraph(x, b)]
doc.build(story)  # 21.11.2026 (titolare): niente in fondo alla pagina, le CGV sono sul nostro sito e allegate ai nostri documenti
