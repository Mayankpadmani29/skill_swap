import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";

export const TeamSection = () => {
  const teamMembers = [
    {
      name: "Prince Merja",
      role: "Frontend Developer & Designer",
      initials: "PM",
      avatar: "/Prince.jpg"
    },
    {
      name: "Rut Rupala",
      role: "Backend Developer",
      initials: "RR",
      avatar: "/Rut.jpg"
    },
    {
      name: "Pal Ghori",
      role: "Validation & Presentation",
      initials: "PG",
      avatar: "./Pal.jpg"
    },
    {
      name: "Palasi Bhesdadiya",
      role: "Research & Validation",
      initials: "BP",
      avatar: "./palasi.jpg"
    },
    {
      name: "Bavarva Devangi",
      role: "Ideas & Support",
      initials: "BD",
      avatar: "./Devangi.jpg"
    }

  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Meet the <span className="gradient-text">Team</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The passionate individuals behind SkillSwap, dedicated to building a community where knowledge flows freely
          </p>
        </motion.div>

        {/* First row - Developers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
          {teamMembers.slice(0, 2).map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="border-border/50 bg-card/30 backdrop-blur hover:bg-card/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Avatar className="w-20 h-20 mx-auto border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-info/20 text-primary text-lg font-semibold">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Second row - Content Team */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {teamMembers.slice(2).map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 2) * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Card className="border-border/50 bg-card/30 backdrop-blur hover:bg-card/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Avatar className="w-20 h-20 mx-auto border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-info/20 text-primary text-lg font-semibold">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};