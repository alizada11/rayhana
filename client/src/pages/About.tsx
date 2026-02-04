import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 bg-secondary/30">
        <div className="container text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl font-bold text-primary"
          >
            {t('about_page.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {t('about_page.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src="/images/about-user.jpg" 
                alt="Rayhana Story" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-serif text-3xl font-bold mb-4 text-primary">
                  {t('about_page.story_title')}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('about_page.story_content')}
                </p>
              </div>
              
              <div>
                <h2 className="font-serif text-3xl font-bold mb-4 text-primary">
                  {t('about_page.mission_title')}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('about_page.mission_content')}
                </p>
              </div>

              {/* Values Grid */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                {[
                  t('about.authenticity'),
                  t('about.innovation'),
                  t('about.quality'),
                  t('about.connection')
                ].map((value, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Story Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="font-serif text-4xl font-bold text-primary">
                {t('about_page.founder_title')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('about_page.founder_content')}
              </p>
              <div className="pt-4 border-l-4 border-primary pl-6">
                <p className="text-sm text-muted-foreground italic">
                  "Rayhana is not just a product, it is a bridge connecting hearts to home."
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            >
              <div className="text-center space-y-4 p-8">
                <div className="text-6xl">🏠</div>
                <p className="text-xl font-serif font-bold text-primary">{t('about_page.title')}</p>
                <p className="text-muted-foreground">{t('hero.subtitle')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
