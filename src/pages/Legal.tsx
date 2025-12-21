import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Shield, Lock, CheckCircle, Server, CreditCard, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Legal = () => {
  const lastUpdate = "21 décembre 2024";

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

        <h1 className="text-4xl font-bold mb-4">Mentions légales</h1>
        
        {/* Badges de confiance */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <Shield className="w-3 h-3 mr-1" />
            Conforme RGPD
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            <Server className="w-3 h-3 mr-1" />
            Données hébergées en Europe
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
            <Lock className="w-3 h-3 mr-1" />
            Données chiffrées
          </Badge>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Suppression sur demande
          </Badge>
        </div>

        <Tabs defaultValue="cgu" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="cgu">CGU</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            <TabsTrigger value="disclaimer">Disclaimers</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>

          {/* CGU */}
          <TabsContent value="cgu">
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Conditions Générales d'Utilisation</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Dernière mise à jour : {lastUpdate}</em>
                </p>
              </div>

              <section>
                <h3 className="text-xl font-semibold mb-2">1. Éditeur de l'application</h3>
                <div className="text-muted-foreground space-y-1">
                  <p><strong>Pulse.ai</strong></p>
                  <p>Application de coaching fitness et nutrition par intelligence artificielle</p>
                  <p>Email de contact : <a href="mailto:general@pulse-ai.app" className="text-primary hover:underline">general@pulse-ai.app</a></p>
                  <p>Site web : <a href="https://pulse-ai.app" className="text-primary hover:underline">https://pulse-ai.app</a></p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">2. Hébergement</h3>
                <div className="text-muted-foreground space-y-1">
                  <p><strong>Infrastructure technique :</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Supabase Inc.</strong> - Base de données et authentification (Hébergement Europe - Allemagne)</li>
                    <li><strong>Vercel Inc.</strong> - Hébergement frontend (CDN mondial avec points de présence européens)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">3. Objet et acceptation</h3>
                <p className="text-muted-foreground">
                  Les présentes conditions générales d'utilisation (CGU) définissent les modalités d'utilisation de l'application Pulse.ai. 
                  En créant un compte ou en utilisant nos services, vous acceptez pleinement et sans réserve ces conditions. 
                  Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement d'utiliser l'application.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">4. Description des services</h3>
                <p className="text-muted-foreground mb-2">
                  Pulse.ai est une application de coaching sportif et nutritionnel assistée par intelligence artificielle. Nos services comprennent :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li><strong>Coach Alex (Entraînement)</strong> : Génération de programmes d'entraînement personnalisés, suivi de progression, ajustements automatiques basés sur vos retours</li>
                  <li><strong>Coach Julie (Nutrition)</strong> : Conseils nutritionnels personnalisés, génération de repas adaptés, suivi des apports</li>
                  <li><strong>Suivi de métriques corporelles</strong> : Enregistrement du poids, tour de taille, suivi de progression</li>
                  <li><strong>Check-ins hebdomadaires</strong> : Bilan de semaine avec ajustement automatique des programmes</li>
                  <li><strong>Support client</strong> : Assistance par email et communauté Discord</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">5. Conditions d'accès</h3>
                <div className="text-muted-foreground space-y-2">
                  <p><strong>Âge minimum :</strong> L'utilisation de Pulse.ai est réservée aux personnes âgées de 18 ans minimum, ou de 16 ans avec accord parental.</p>
                  <p><strong>Compte utilisateur :</strong> Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées depuis votre compte.</p>
                  <p><strong>Informations exactes :</strong> Vous vous engagez à fournir des informations exactes et à jour, notamment concernant votre état de santé.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">6. Abonnement et facturation</h3>
                <div className="text-muted-foreground space-y-2">
                  <p><strong>Période d'essai :</strong> Une période d'essai gratuite de 7 jours est proposée aux nouveaux utilisateurs.</p>
                  <p><strong>Tarification :</strong> Les tarifs en vigueur sont affichés sur notre page Tarif. Tous les prix sont en euros TTC.</p>
                  <p><strong>Renouvellement :</strong> L'abonnement se renouvelle automatiquement à chaque échéance sauf résiliation préalable.</p>
                  <p><strong>Résiliation :</strong> Vous pouvez résilier votre abonnement à tout moment depuis les paramètres de votre compte. La résiliation prend effet à la fin de la période en cours.</p>
                  <p><strong>Remboursement :</strong> Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques fournis immédiatement après l'achat. Aucun remboursement n'est donc possible une fois l'abonnement activé.</p>
                  <p><strong>Paiement sécurisé :</strong> Les paiements sont traités par Stripe, plateforme certifiée PCI-DSS niveau 1. Nous n'avons jamais accès à vos coordonnées bancaires complètes.</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">7. Règles d'utilisation</h3>
                <p className="text-muted-foreground mb-2">L'utilisateur s'engage à :</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Utiliser l'application conformément à son objet</li>
                  <li>Ne pas tenter d'accéder aux données d'autres utilisateurs</li>
                  <li>Ne pas contourner les mesures de sécurité</li>
                  <li>Ne pas utiliser l'application à des fins commerciales non autorisées</li>
                  <li>Ne pas diffuser de contenu illégal, offensant ou inapproprié via les fonctions de chat</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  Le non-respect de ces règles peut entraîner la suspension ou la résiliation de votre compte sans préavis ni remboursement.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">8. Propriété intellectuelle</h3>
                <p className="text-muted-foreground">
                  L'ensemble des éléments de l'application Pulse.ai (marque, logo, textes, images, vidéos, algorithmes, code source) 
                  sont protégés par les droits de propriété intellectuelle. Toute reproduction, représentation, modification ou exploitation 
                  non autorisée est strictement interdite et pourra faire l'objet de poursuites.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">9. Limitation de responsabilité</h3>
                <p className="text-muted-foreground">
                  Pulse.ai s'engage à fournir des services de qualité mais ne garantit pas l'absence totale d'erreurs ou d'interruptions. 
                  Notre responsabilité est limitée au montant des sommes versées par l'utilisateur au cours des 12 derniers mois. 
                  Nous déclinons toute responsabilité pour les dommages indirects, la perte de données ou de bénéfices.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">10. Modification des CGU</h3>
                <p className="text-muted-foreground">
                  Pulse.ai se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés 
                  par email ou notification in-app au moins 30 jours avant l'entrée en vigueur des modifications substantielles. 
                  La poursuite de l'utilisation après cette date vaut acceptation des nouvelles conditions.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">11. Droit applicable et juridiction</h3>
                <p className="text-muted-foreground">
                  Les présentes CGU sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, 
                  les tribunaux français seront seuls compétents. Conformément à l'article L612-1 du Code de la consommation, 
                  vous pouvez également recourir gratuitement au médiateur de la consommation.
                </p>
              </section>
            </Card>
          </TabsContent>

          {/* Confidentialité */}
          <TabsContent value="privacy">
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Politique de Confidentialité (RGPD)</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Dernière mise à jour : {lastUpdate}</em>
                </p>
              </div>

              {/* Encadré rassurant */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-700 mb-1">Vos données sont en sécurité</h4>
                    <p className="text-sm text-muted-foreground">
                      Chez Pulse.ai, la protection de vos données personnelles est une priorité absolue. 
                      Vos informations sont chiffrées, hébergées en Europe, et ne sont jamais vendues à des tiers.
                      Vous gardez le contrôle total sur vos données.
                    </p>
                  </div>
                </div>
              </div>

              <section>
                <h3 className="text-xl font-semibold mb-2">1. Responsable du traitement</h3>
                <div className="text-muted-foreground">
                  <p>Le responsable du traitement des données personnelles est Pulse.ai.</p>
                  <p className="mt-2"><strong>Contact DPO (Délégué à la Protection des Données) :</strong></p>
                  <p>Email : <a href="mailto:general@pulse-ai.app" className="text-primary hover:underline">general@pulse-ai.app</a></p>
                  <p className="text-sm mt-1">Délai de réponse : 30 jours maximum</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">2. Données collectées</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">📋 Données d'identification</h4>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                      <li>Nom / Prénom</li>
                      <li>Adresse email</li>
                      <li>Identifiant unique de compte</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">💪 Données physiologiques et de santé</h4>
                    <p className="text-xs text-amber-600 mb-2">⚠️ Catégorie sensible au sens du RGPD - Traitement avec votre consentement explicite</p>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                      <li>Poids, taille, âge, sexe</li>
                      <li>Tour de taille et évolution</li>
                      <li>Niveau d'activité physique</li>
                      <li>Conditions de santé déclarées (diabète, problèmes cardiaques, etc.)</li>
                      <li>Allergies et restrictions alimentaires</li>
                      <li>Zones de douleur signalées</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">🏋️ Données d'entraînement</h4>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                      <li>Objectifs fitness (perte de poids, prise de muscle, etc.)</li>
                      <li>Préférences d'entraînement (équipement, fréquence, durée)</li>
                      <li>Sessions effectuées et progression</li>
                      <li>Feedback et RPE (effort ressenti)</li>
                      <li>Check-ins hebdomadaires</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">🥗 Données nutritionnelles</h4>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                      <li>Préférences alimentaires et restrictions</li>
                      <li>Nombre de repas par jour</li>
                      <li>Historique des repas générés</li>
                      <li>Suivi d'hydratation</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">💬 Conversations avec les coachs IA</h4>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                      <li>Messages échangés avec Coach Alex et Coach Julie</li>
                      <li>Historique des conversations</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">💳 Données de paiement</h4>
                    <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                      <li>Identifiant client Stripe</li>
                      <li>Historique des transactions (montant, date)</li>
                      <li>Statut d'abonnement</li>
                    </ul>
                    <p className="text-xs text-green-600 mt-2">✓ Vos coordonnées bancaires sont gérées exclusivement par Stripe et ne transitent jamais par nos serveurs</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">3. Utilisation par l'Intelligence Artificielle</h3>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lock className="w-6 h-6 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">Transparence sur l'utilisation de l'IA</h4>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>
                          <strong>Comment l'IA utilise vos données :</strong> Vos informations personnelles (profil, objectifs, préférences, historique) 
                          sont transmises à nos modèles d'IA pour générer des recommandations personnalisées d'entraînement et de nutrition.
                        </p>
                        <p>
                          <strong>Fournisseur IA :</strong> Nous utilisons les services de Lovable AI (modèles Google Gemini) pour le traitement intelligent.
                        </p>
                        <p>
                          <strong>Garanties :</strong>
                        </p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>Vos données ne sont pas utilisées pour entraîner des modèles IA tiers</li>
                          <li>Les conversations sont traitées de manière confidentielle</li>
                          <li>Aucune donnée n'est vendue ou partagée à des fins commerciales</li>
                          <li>Les données transmises à l'IA sont pseudonymisées quand possible</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">4. Base légale des traitements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Traitement</th>
                        <th className="text-left p-2">Base légale</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="p-2">Création et gestion du compte</td>
                        <td className="p-2">Exécution du contrat</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Génération des programmes personnalisés</td>
                        <td className="p-2">Exécution du contrat</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Traitement des données de santé</td>
                        <td className="p-2">Consentement explicite (Article 9 RGPD)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Facturation et paiement</td>
                        <td className="p-2">Exécution du contrat + Obligation légale</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Amélioration des services</td>
                        <td className="p-2">Intérêt légitime</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Communications marketing</td>
                        <td className="p-2">Consentement</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Sous-traitants et transferts de données</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Server className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Supabase Inc.</p>
                      <p className="text-sm text-muted-foreground">Base de données et authentification - Hébergé en Europe (Allemagne)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Stripe Inc.</p>
                      <p className="text-sm text-muted-foreground">Traitement des paiements - Certifié PCI-DSS, conforme RGPD</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Lovable AI (Google Gemini)</p>
                      <p className="text-sm text-muted-foreground">Traitement IA - Clauses contractuelles types pour transferts hors UE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Server className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Vercel Inc.</p>
                      <p className="text-sm text-muted-foreground">Hébergement frontend - CDN avec points de présence européens</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Resend</p>
                      <p className="text-sm text-muted-foreground">Envoi d'emails transactionnels</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Durée de conservation</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Type de données</th>
                        <th className="text-left p-2">Durée de conservation</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="p-2">Données de compte</td>
                        <td className="p-2">Durée de l'abonnement + 3 ans (prescription civile)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Données de santé</td>
                        <td className="p-2">Durée de l'abonnement + 1 an</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Historique d'entraînement</td>
                        <td className="p-2">Durée de l'abonnement + 1 an</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Conversations IA</td>
                        <td className="p-2">Durée de l'abonnement + 6 mois</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Données de facturation</td>
                        <td className="p-2">10 ans (obligation légale comptable)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Logs techniques</td>
                        <td className="p-2">12 mois</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">7. Vos droits RGPD</h3>
                <p className="text-muted-foreground mb-3">
                  Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
                </p>
                <div className="grid gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">✓ Droit d'accès</p>
                    <p className="text-sm text-muted-foreground">Obtenir une copie de toutes vos données personnelles</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">✓ Droit de rectification</p>
                    <p className="text-sm text-muted-foreground">Corriger vos données inexactes ou incomplètes</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">✓ Droit à l'effacement ("droit à l'oubli")</p>
                    <p className="text-sm text-muted-foreground">Demander la suppression de toutes vos données</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">✓ Droit à la portabilité</p>
                    <p className="text-sm text-muted-foreground">Récupérer vos données dans un format structuré et réutilisable</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">✓ Droit d'opposition</p>
                    <p className="text-sm text-muted-foreground">Vous opposer au traitement de vos données pour des motifs légitimes</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">✓ Droit de retirer votre consentement</p>
                    <p className="text-sm text-muted-foreground">À tout moment pour les traitements basés sur le consentement</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="font-semibold mb-2">Comment exercer vos droits ?</p>
                  <p className="text-sm text-muted-foreground">
                    Envoyez un email à <a href="mailto:general@pulse-ai.app" className="text-primary hover:underline">general@pulse-ai.app</a> avec l'objet "Demande RGPD" 
                    en précisant votre demande et en joignant une copie de pièce d'identité. Réponse sous 30 jours maximum.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  En cas de litige non résolu, vous pouvez introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">8. Sécurité des données</h3>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-3">Mesures de protection mises en place</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span><strong>Chiffrement en transit</strong> : Toutes les communications sont protégées par HTTPS/TLS 1.3</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span><strong>Chiffrement au repos</strong> : Vos données sont chiffrées dans notre base de données</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span><strong>Row Level Security</strong> : Isolation stricte des données entre utilisateurs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span><strong>Authentification sécurisée</strong> : Mots de passe hashés, protection contre les attaques</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span><strong>Suppression complète</strong> : Fonction de suppression de compte qui efface toutes vos données</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Encadré suppression de compte */}
              <div className="p-4 bg-muted/50 border rounded-lg">
                <h4 className="font-semibold mb-2">🗑️ Supprimer mon compte et mes données</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Vous pouvez supprimer définitivement votre compte et toutes vos données à tout moment depuis les paramètres de l'application 
                  (Réglages → Mon abonnement → Supprimer mon compte).
                </p>
                <p className="text-sm text-muted-foreground">
                  Cette action supprime : votre profil, vos données de santé, votre historique d'entraînement, vos conversations IA, 
                  et résilie automatiquement votre abonnement Stripe.
                </p>
              </div>
            </Card>
          </TabsContent>

          {/* Disclaimers */}
          <TabsContent value="disclaimer">
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Avertissements et Disclaimers</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Dernière mise à jour : {lastUpdate}</em>
                </p>
              </div>

              {/* Avertissement principal */}
              <section className="bg-destructive/10 border-l-4 border-destructive p-4 rounded">
                <h3 className="text-xl font-semibold mb-2 text-destructive">
                  ⚠️ Avertissement Médical Important
                </h3>
                <div className="space-y-2 text-foreground">
                  <p>
                    <strong>Pulse.ai n'est PAS un dispositif médical</strong> au sens de la réglementation européenne (Règlement UE 2017/745).
                  </p>
                  <p>
                    <strong>Les coachs IA (Alex et Julie) ne sont PAS des professionnels de santé</strong>. Ils sont des assistants virtuels 
                    fournissant des conseils généraux de bien-être basés sur vos données.
                  </p>
                  <p>
                    <strong>Les recommandations fournies ne remplacent en aucun cas un avis médical professionnel</strong>, 
                    un diagnostic ou un traitement médical.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">Consultation médicale obligatoire</h3>
                <p className="text-muted-foreground mb-2">
                  Vous DEVEZ obligatoirement consulter un médecin avant d'utiliser Pulse.ai si :
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Vous avez des problèmes cardiaques ou cardiovasculaires</li>
                  <li>Vous souffrez de diabète (type 1 ou 2)</li>
                  <li>Vous avez de l'hypertension (contrôlée ou non)</li>
                  <li>Vous êtes enceinte ou allaitez</li>
                  <li>Vous avez des blessures ou douleurs chroniques</li>
                  <li>Vous prenez des médicaments sur prescription</li>
                  <li>Vous avez des antécédents de troubles alimentaires</li>
                  <li>Vous avez plus de 40 ans et êtes sédentaire depuis plus d'un an</li>
                  <li>Vous avez une condition médicale préexistante quelle qu'elle soit</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3 text-destructive">⛔ Contre-indications absolues</h3>
                <p className="text-destructive font-semibold mb-2">
                  L'utilisation de Pulse.ai est DÉCONSEILLÉE sans accord médical explicite écrit si vous présentez :
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm font-medium">Troubles alimentaires</p>
                    <p className="text-xs text-muted-foreground">Anorexie, boulimie, orthorexie</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm font-medium">Diabète non stabilisé</p>
                    <p className="text-xs text-muted-foreground">Glycémie non contrôlée</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm font-medium">Troubles cardiaques</p>
                    <p className="text-xs text-muted-foreground">Insuffisance cardiaque, arythmie</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm font-medium">Hypertension sévère</p>
                    <p className="text-xs text-muted-foreground">Non contrôlée par traitement</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm font-medium">Ostéoporose sévère</p>
                    <p className="text-xs text-muted-foreground">Risque de fracture élevé</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm font-medium">Grossesse à risque</p>
                    <p className="text-xs text-muted-foreground">Ou grossesse au-delà du 1er trimestre</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">Responsabilité de l'utilisateur</h3>
                <div className="text-muted-foreground space-y-2">
                  <p>En utilisant Pulse.ai, vous déclarez et garantissez que :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Vous êtes en bonne santé générale ou avez obtenu l'accord de votre médecin</li>
                    <li>Les informations que vous fournissez sont exactes et complètes</li>
                    <li>Vous avez signalé toutes vos conditions médicales connues</li>
                    <li>Vous comprenez que toute activité physique comporte des risques de blessure</li>
                    <li>Vous vous engagez à stopper immédiatement en cas de douleur anormale</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">Limitation de responsabilité</h3>
                <div className="text-muted-foreground space-y-2">
                  <p>En utilisant Pulse.ai, vous reconnaissez et acceptez expressément que :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Risques inhérents :</strong> Toute activité physique comporte des risques de blessure. 
                      Vous assumez l'entière responsabilité de ces risques.
                    </li>
                    <li>
                      <strong>Aucune garantie de résultats :</strong> Pulse.ai ne garantit aucun résultat spécifique. 
                      Les résultats varient selon les individus, leur assiduité et de nombreux facteurs externes.
                    </li>
                    <li>
                      <strong>Conseils généraux :</strong> Nos recommandations nutritionnelles sont des suggestions générales 
                      de bien-être et non des prescriptions diététiques ou médicales.
                    </li>
                    <li>
                      <strong>Limitation des dommages :</strong> Pulse.ai décline toute responsabilité pour les dommages 
                      directs, indirects, accidentels ou consécutifs résultant de l'utilisation de l'application.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">🚨 En cas d'urgence</h3>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-foreground font-semibold mb-2">
                    Si vous ressentez l'un des symptômes suivants pendant ou après l'exercice, ARRÊTEZ IMMÉDIATEMENT et consultez un professionnel de santé :
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Douleur thoracique ou oppression</li>
                    <li>Essoufflement anormal</li>
                    <li>Étourdissements ou vertiges</li>
                    <li>Palpitations cardiaques</li>
                    <li>Douleur irradiant vers le bras, la mâchoire ou le dos</li>
                    <li>Nausées soudaines</li>
                  </ul>
                  <p className="text-destructive font-bold mt-3">
                    En cas d'urgence vitale : appelez le 15 (SAMU) ou le 112
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Propriété intellectuelle</h3>
                <p className="text-muted-foreground">
                  L'ensemble des contenus de Pulse.ai (textes, images, logos, algorithmes, programmes d'entraînement générés, 
                  interfaces) sont protégés par le droit d'auteur et les droits de propriété intellectuelle. 
                  Toute reproduction, modification, distribution ou exploitation non autorisée est strictement interdite 
                  et pourra faire l'objet de poursuites judiciaires.
                </p>
              </section>
            </Card>
          </TabsContent>

          {/* Cookies */}
          <TabsContent value="cookies">
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Politique de Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  <em>Dernière mise à jour : {lastUpdate}</em>
                </p>
              </div>

              <section>
                <h3 className="text-xl font-semibold mb-2">Qu'est-ce qu'un cookie ?</h3>
                <p className="text-muted-foreground">
                  Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) 
                  lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et préférences 
                  (identifiant de connexion, langue, taille de police, etc.) sur une période donnée.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">Cookies utilisés par Pulse.ai</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">🔒 Cookies essentiels (obligatoires)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ces cookies sont indispensables au fonctionnement de l'application. Sans eux, vous ne pourriez pas utiliser Pulse.ai.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li><strong>Session d'authentification</strong> : Maintient votre connexion active</li>
                      <li><strong>Token de sécurité</strong> : Protège contre les attaques CSRF</li>
                      <li><strong>Préférences de session</strong> : Mémorise vos choix pendant la navigation</li>
                    </ul>
                    <p className="text-xs text-green-600 mt-2">Durée : Session ou jusqu'à 30 jours pour "Se souvenir de moi"</p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">⚙️ Cookies fonctionnels</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ces cookies améliorent votre expérience utilisateur en mémorisant vos préférences.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li><strong>Thème (clair/sombre)</strong> : Mémorise votre préférence d'affichage</li>
                      <li><strong>Langue</strong> : Conserve votre choix de langue</li>
                      <li><strong>Onboarding</strong> : Évite de réafficher les tutoriels déjà vus</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-2">Durée : 1 an</p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">📊 Cookies analytiques (optionnels)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Actuellement, Pulse.ai <strong>n'utilise pas de cookies analytiques</strong> tiers 
                      (pas de Google Analytics, pas de tracking publicitaire).
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Si nous décidons d'en implémenter à l'avenir, vous en serez informé et pourrez donner ou refuser votre consentement.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">Cookies tiers</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">Stripe (paiement)</p>
                    <p className="text-sm text-muted-foreground">
                      Stripe utilise des cookies pour la détection de fraude et la sécurité des paiements. 
                      Ces cookies sont essentiels pour le traitement sécurisé de vos paiements.
                    </p>
                    <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      Politique de confidentialité Stripe →
                    </a>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">Supabase (authentification)</p>
                    <p className="text-sm text-muted-foreground">
                      Supabase utilise des cookies pour gérer votre session d'authentification de manière sécurisée.
                    </p>
                    <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      Politique de confidentialité Supabase →
                    </a>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Gérer vos cookies</h3>
                <div className="text-muted-foreground space-y-2">
                  <p>
                    Vous pouvez à tout moment gérer vos préférences de cookies via les paramètres de votre navigateur :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                    <li><a href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                    <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                    <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
                  </ul>
                  <p className="mt-3 text-sm">
                    <strong>Note :</strong> La désactivation des cookies essentiels peut empêcher le fonctionnement normal de l'application 
                    (impossibilité de se connecter, perte de session, etc.).
                  </p>
                </div>
              </section>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact et confiance */}
        <Card className="p-6 mt-8 bg-muted/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Une question ? Contactez-nous</h3>
              <p className="text-sm text-muted-foreground">
                Pour toute question concernant nos mentions légales, notre politique de confidentialité, 
                ou pour exercer vos droits RGPD, contactez-nous :
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  📧 Email : <a href="mailto:general@pulse-ai.app" className="text-primary hover:underline">general@pulse-ai.app</a>
                </p>
                <p className="text-sm">
                  📄 Support : <Link to="/support" className="text-primary hover:underline">Page de support</Link>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                <Shield className="w-3 h-3 mr-1" />
                RGPD
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                <Lock className="w-3 h-3 mr-1" />
                Sécurisé
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Legal;
