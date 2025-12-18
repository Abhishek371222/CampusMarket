import { motion } from "framer-motion";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using Campus Market, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Use License",
      content: "Permission is granted to temporarily download one copy of the materials (information or software) on Campus Market for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:"
    },
    {
      title: "3. Disclaimer",
      content: "The materials on Campus Market are provided on an 'as is' basis. Campus Market makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
    },
    {
      title: "4. Limitations",
      content: "In no event shall Campus Market or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Campus Market, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage."
    },
    {
      title: "5. Accuracy of Materials",
      content: "The materials appearing on Campus Market could include technical, typographical, or photographic errors. Campus Market does not warrant that any of the materials on its website are accurate, complete, or current. Campus Market may make changes to the materials contained on its website at any time without notice."
    },
    {
      title: "6. Links",
      content: "Campus Market has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Campus Market of the site. Use of any such linked website is at the user's own risk."
    },
    {
      title: "7. Modifications",
      content: "Campus Market may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service."
    },
    {
      title: "8. Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-display font-bold mb-4 text-primary">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-bold mb-2">Questions?</h3>
          <p className="text-muted-foreground">If you have any questions about these Terms and Conditions, please contact us at support@campusmarket.com</p>
        </motion.div>
      </div>
    </div>
  );
}
