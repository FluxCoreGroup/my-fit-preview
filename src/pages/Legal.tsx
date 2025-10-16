import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const Legal = () => {
  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Mentions légales</h1>

        <Tabs defaultValue="cgu" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="cgu">CGU</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            <TabsTrigger value="disclaimer">Disclaimers</TabsTrigger>
          </TabsList>

          {/* CGU */}
          <TabsContent value="cgu">
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Conditions Générales d'Utilisation</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Dernière mise à jour : [À COMPLÉTER]</em>
                </p>
              </div>

              <section>
                <h3 className="text-xl font-semibold mb-2">1. Objet</h3>
                <p className="text-muted-foreground">
                  Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir
                  les modalités et conditions d'utilisation de l'application Pulse.ai, ainsi que les
                  droits et obligations des utilisateurs.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">2. Acceptation des CGU</h3>
                <p className="text-muted-foreground">
                  L'utilisation de Pulse.ai implique l'acceptation pleine et entière des présentes
                  CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">3. Services proposés</h3>
                <p className="text-muted-foreground">
                  Pulse.ai propose des programmes d'entraînement et de nutrition personnalisés
                  générés par intelligence artificielle. Nos services comprennent :
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Génération de plans d'entraînement personnalisés</li>
                  <li>Recommandations nutritionnelles</li>
                  <li>Suivi de progression</li>
                  <li>Support client</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">4. Abonnement et facturation</h3>
                <p className="text-muted-foreground">
                  L'accès complet aux services Pulse.ai nécessite un abonnement payant. Les tarifs
                  sont indiqués sur notre site et peuvent être modifiés. Tout changement de tarif
                  sera communiqué à l'avance. L'abonnement est résiliable à tout moment.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">5. Responsabilités</h3>
                <p className="text-muted-foreground">
                  Pulse.ai s'engage à fournir des recommandations basées sur les informations
                  fournies par l'utilisateur. Toutefois, nous ne sommes pas responsables en cas de
                  blessure ou de problème de santé résultant de l'utilisation de nos services.
                </p>
              </section>

              <p className="text-sm text-muted-foreground italic mt-8">
                [CGU COMPLÈTES À RÉDIGER AVEC UN JURISTE]
              </p>
            </Card>
          </TabsContent>

          {/* Confidentialité */}
          <TabsContent value="privacy">
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Politique de Confidentialité (RGPD)</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Dernière mise à jour : [À COMPLÉTER]</em>
                </p>
              </div>

              <section>
                <h3 className="text-xl font-semibold mb-2">1. Données collectées</h3>
                <p className="text-muted-foreground mb-2">Nous collectons les données suivantes :</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Informations d'identification (nom, email)</li>
                  <li>Données physiologiques (poids, taille, âge, sexe)</li>
                  <li>Objectifs et préférences d'entraînement</li>
                  <li>Données de progression et feedback</li>
                  <li>Informations de paiement (via Stripe, non stockées chez nous)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">2. Utilisation des données</h3>
                <p className="text-muted-foreground">
                  Vos données sont utilisées pour personnaliser votre expérience, générer vos plans
                  d'entraînement et nutrition, suivre votre progression et améliorer nos services.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">3. Partage des données</h3>
                <p className="text-muted-foreground">
                  Nous ne vendons ni ne louons vos données personnelles. Vos données peuvent être
                  partagées avec des prestataires tiers nécessaires au fonctionnement du service
                  (hébergement, paiement), tous conformes au RGPD.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">4. Vos droits (RGPD)</h3>
                <p className="text-muted-foreground mb-2">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Droit d'accès à vos données</li>
                  <li>Droit de rectification</li>
                  <li>Droit à l'effacement ("droit à l'oubli")</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d'opposition au traitement</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  Pour exercer ces droits, contactez-nous via notre page de support.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">5. Sécurité</h3>
                <p className="text-muted-foreground">
                  Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger
                  vos données contre tout accès, modification ou divulgation non autorisés.
                </p>
              </section>

              <p className="text-sm text-muted-foreground italic mt-8">
                [POLITIQUE COMPLÈTE À RÉDIGER AVEC UN JURISTE / DPO]
              </p>
            </Card>
          </TabsContent>

          {/* Disclaimers */}
          <TabsContent value="disclaimer">
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Avertissements et Disclaimers</h2>
              </div>

              <section className="bg-destructive/10 border-l-4 border-destructive p-4 rounded">
                <h3 className="text-xl font-semibold mb-2 text-destructive">
                  ⚠️ Avertissement Médical Important
                </h3>
                <p className="text-foreground">
                  Pulse.ai propose des conseils généraux de bien-être et de fitness. Nos services
                  <strong> NE REMPLACENT PAS un avis médical professionnel</strong>.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Avant de commencer</h3>
                <p className="text-muted-foreground mb-2">
                  Consultez obligatoirement un médecin avant de débuter tout programme d'exercice si :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Vous avez des problèmes cardiaques ou cardiovasculaires</li>
                  <li>Vous êtes enceinte ou allaitez</li>
                  <li>Vous avez des blessures ou douleurs chroniques</li>
                  <li>Vous prenez des médicaments sur prescription</li>
                  <li>Vous avez des conditions médicales préexistantes</li>
                  <li>Vous avez plus de 40 ans et êtes sédentaire depuis longtemps</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Limitation de responsabilité</h3>
                <p className="text-muted-foreground">
                  En utilisant Pulse.ai, vous reconnaissez et acceptez que :
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>
                    Toute activité physique comporte des risques de blessure. Vous assumez ces
                    risques.
                  </li>
                  <li>
                    Pulse.ai ne garantit pas de résultats spécifiques. Les résultats varient selon
                    les individus.
                  </li>
                  <li>
                    Nos recommandations nutritionnelles sont des suggestions générales, pas des
                    prescriptions diététiques.
                  </li>
                  <li>
                    En cas de douleur, malaise ou symptômes inhabituels, arrêtez immédiatement et
                    consultez un professionnel de santé.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Cas à risque - Red Flags</h3>
                <p className="text-destructive font-semibold mb-2">
                  Si vous présentez l'un des cas suivants, l'utilisation de Pulse.ai est
                  déconseillée sans accord médical explicite :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Troubles alimentaires (anorexie, boulimie)</li>
                  <li>Diabète non stabilisé</li>
                  <li>Troubles cardiaques</li>
                  <li>Hypertension non contrôlée</li>
                  <li>Ostéoporose sévère</li>
                  <li>Grossesse à risque</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Propriété intellectuelle</h3>
                <p className="text-muted-foreground">
                  Tous les contenus (textes, images, vidéos, logos) sont la propriété de Pulse.ai
                  ou de ses partenaires. Toute reproduction ou utilisation non autorisée est
                  interdite.
                </p>
              </section>

              <p className="text-sm text-muted-foreground italic mt-8">
                [DISCLAIMERS COMPLETS À VALIDER AVEC UN JURISTE + ASSURANCE RC PRO]
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-6 mt-8 bg-muted/50">
          <h3 className="font-semibold mb-2">Contact</h3>
          <p className="text-sm text-muted-foreground">
            Pour toute question concernant nos mentions légales, notre politique de confidentialité
            ou pour exercer vos droits RGPD, contactez-nous via notre{" "}
            <Link to="/support" className="text-primary hover:underline">
              page de support
            </Link>
            .
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Legal;
