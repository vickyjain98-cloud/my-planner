/* My Planner — static reference data. Contains no personal data. */
"use strict";
window.MP_DATA = {
  /* Purnima (P) / Amavasya (A): tithi prevailing at sunrise, New Delhi. Computed 2026–2035. */
  moons: {"2026-01-03":"P","2026-01-18":"A","2026-02-01":"P","2026-02-17":"A","2026-03-03":"P","2026-03-19":"A","2026-04-02":"P","2026-04-17":"A","2026-05-01":"P","2026-05-16":"A","2026-05-31":"P","2026-06-15":"A","2026-06-29":"P","2026-07-14":"A","2026-07-29":"P","2026-08-12":"A","2026-08-28":"P","2026-09-11":"A","2026-09-26":"P","2026-10-10":"A","2026-10-26":"P","2026-11-09":"A","2026-11-24":"P","2026-12-08":"A","2026-12-23":"P","2027-01-07":"A","2027-01-22":"P","2027-02-06":"A","2027-02-20":"P","2027-03-08":"A","2027-03-22":"P","2027-04-06":"A","2027-04-20":"P","2027-05-06":"A","2027-05-20":"P","2027-06-04":"A","2027-06-18":"P","2027-07-04":"A","2027-07-18":"P","2027-08-02":"A","2027-08-17":"P","2027-08-31":"A","2027-09-15":"P","2027-09-30":"A","2027-10-15":"P","2027-10-29":"A","2027-11-14":"P","2027-11-28":"A","2027-12-13":"P","2027-12-27":"A","2028-01-12":"P","2028-01-26":"A","2028-02-10":"P","2028-02-25":"A","2028-03-11":"P","2028-03-26":"A","2028-04-09":"P","2028-04-24":"A","2028-05-08":"P","2028-05-24":"A","2028-06-07":"P","2028-06-22":"A","2028-07-06":"P","2028-07-22":"A","2028-08-05":"P","2028-08-20":"A","2028-09-03":"P","2028-09-18":"A","2028-10-03":"P","2028-10-18":"A","2028-11-02":"P","2028-11-16":"A","2028-12-01":"P","2028-12-16":"A","2028-12-31":"P","2029-01-14":"A","2029-01-30":"P","2029-02-13":"A","2029-02-28":"P","2029-03-15":"A","2029-03-30":"P","2029-04-13":"A","2029-04-28":"P","2029-05-13":"A","2029-05-27":"P","2029-06-12":"A","2029-06-26":"P","2029-07-11":"A","2029-07-25":"P","2029-08-10":"A","2029-08-24":"P","2029-09-08":"A","2029-09-22":"P","2029-10-07":"A","2029-10-22":"P","2029-11-06":"A","2029-11-21":"P","2029-12-05":"A","2029-12-20":"P","2030-01-04":"A","2030-01-19":"P","2030-02-02":"A","2030-02-18":"P","2030-03-04":"A","2030-03-19":"P","2030-04-02":"A","2030-04-18":"P","2030-05-02":"A","2030-05-17":"P","2030-06-01":"A","2030-06-15":"P","2030-06-30":"A","2030-07-15":"P","2030-07-30":"A","2030-08-13":"P","2030-08-28":"A","2030-09-11":"P","2030-09-27":"A","2030-10-11":"P","2030-10-26":"A","2030-11-10":"P","2030-11-25":"A","2030-12-09":"P","2030-12-24":"A","2031-01-08":"P","2031-01-23":"A","2031-02-07":"P","2031-02-21":"A","2031-03-09":"P","2031-03-23":"A","2031-04-07":"P","2031-04-21":"A","2031-05-07":"P","2031-05-21":"A","2031-06-05":"P","2031-06-19":"A","2031-07-04":"P","2031-07-19":"A","2031-08-03":"P","2031-08-18":"A","2031-09-01":"P","2031-09-16":"A","2031-09-30":"P","2031-10-16":"A","2031-10-30":"P","2031-11-14":"A","2031-11-28":"P","2031-12-14":"A","2031-12-28":"P","2032-01-12":"A","2032-01-27":"P","2032-02-11":"A","2032-02-26":"P","2032-03-11":"A","2032-03-26":"P","2032-04-10":"A","2032-04-25":"P","2032-05-09":"A","2032-05-25":"P","2032-06-08":"A","2032-06-23":"P","2032-07-07":"A","2032-07-22":"P","2032-08-06":"A","2032-08-21":"P","2032-09-04":"A","2032-09-19":"P","2032-10-04":"A","2032-10-18":"P","2032-11-03":"A","2032-11-17":"P","2032-12-02":"A","2032-12-16":"P","2033-01-01":"A","2033-01-15":"P","2033-01-30":"A","2033-02-14":"P","2033-03-01":"A","2033-03-15":"P","2033-03-30":"A","2033-04-14":"P","2033-04-29":"A","2033-05-14":"P","2033-05-28":"A","2033-06-12":"P","2033-06-26":"A","2033-07-12":"P","2033-07-26":"A","2033-08-10":"P","2033-08-24":"A","2033-09-09":"P","2033-09-23":"A","2033-10-08":"P","2033-10-23":"A","2033-11-06":"P","2033-11-21":"A","2033-12-06":"P","2033-12-21":"A","2034-01-04":"P","2034-01-20":"A","2034-02-03":"P","2034-02-18":"A","2034-03-04":"P","2034-03-20":"A","2034-04-03":"P","2034-04-18":"A","2034-05-03":"P","2034-05-18":"A","2034-06-02":"P","2034-06-16":"A","2034-07-01":"P","2034-07-15":"A","2034-07-31":"P","2034-08-14":"A","2034-08-29":"P","2034-09-12":"A","2034-09-28":"P","2034-10-12":"A","2034-10-27":"P","2034-11-10":"A","2034-11-25":"P","2034-12-10":"A","2034-12-25":"P","2035-01-09":"A","2035-01-23":"P","2035-02-08":"A","2035-02-22":"P","2035-03-09":"A","2035-03-23":"P","2035-04-08":"A","2035-04-22":"P","2035-05-07":"A","2035-05-22":"P","2035-06-06":"A","2035-06-20":"P","2035-07-05":"A","2035-07-20":"P","2035-08-03":"A","2035-08-18":"P","2035-09-02":"A","2035-09-17":"P","2035-10-01":"A","2035-10-17":"P","2035-10-31":"A","2035-11-15":"P","2035-11-29":"A","2035-12-14":"P","2035-12-29":"A"},
  portals: {"1-1":"1/1 New Year Portal","1-11":"1/11 Portal","2-2":"2/2 Portal","2-22":"2/22 Portal","3-3":"3/3 Portal","4-4":"4/4 Portal","5-5":"5/5 Portal","6-6":"6/6 Portal","7-7":"7/7 Portal","8-8":"8/8 Lion's Gate Portal","9-9":"9/9 Portal","10-10":"10/10 Portal","11-1":"11/1 Portal","11-11":"11:11 Portal","12-12":"12/12 Portal"},
  aff: {
    classic: { name: "Classic New Thought", note: "Public-domain lines, word for word", items: [
      ["I have a perfect work / In a perfect way; / I give a perfect service / For perfect pay.", "Florence Scovel Shinn, 1925"],
      ["God is my unfailing supply, and large sums of money come to me quickly, under grace, in perfect ways.", "Florence Scovel Shinn, 1925"],
      ["Divine Love floods my consciousness with health, and every cell in my body is filled with light.", "Florence Scovel Shinn, 1925"],
      ["I am divinely sensitive to my intuitive leads, and give instant obedience to Thy will.", "Florence Scovel Shinn, 1925"],
      ["I see clearly the perfect plan.", "Florence Scovel Shinn, 1925"],
      ["I hear glad tidings of great joy.", "Florence Scovel Shinn, 1925"],
      ["Divine Love now dissolves and dissipates every wrong condition in my mind, body and affairs.", "Florence Scovel Shinn, 1925"],
      ["As I am one with God, I am one with my good, for God is both the Giver and the Gift.", "Florence Scovel Shinn, 1925"],
      ["My eyes are God's eyes, I see with the eyes of spirit. I see clearly the open way; there are no obstacles on my pathway.", "Florence Scovel Shinn, 1925"],
      ["I cast this burden on the Christ within, and I go free!", "Florence Scovel Shinn, 1925"],
      ["Every day, in every way, I am getting better and better.", "Émile Coué"]
    ]},
    secret: { name: "The Secret style", note: "Original lines: gratitude and attraction", items: [
      ["Thank you for everything I have, and for everything that is on its way to me."],
      ["I feel it as already done, and I am grateful."],
      ["I am a magnet for good news, good people and good results."],
      ["What I focus on grows, so I focus on what I want."],
      ["Life is rearranging itself in my favour today."],
      ["I receive easily and I give generously."],
      ["My thoughts are seeds; I plant only what I want to grow."],
      ["I see the result clearly, and every step towards it feels natural."],
      ["Abundance flows to me through my work, my words and my gratitude."],
      ["Everything is working out for me, even when I cannot see how yet."],
      ["I am ready to receive the good I have asked for."],
      ["Gratitude opens every door I need."]
    ]},
    love: { name: "Self-love", note: "The most-searched modern affirmations", items: [
      ["I am enough."], ["I am loved."], ["I love myself."], ["I am worthy of good things."],
      ["I am allowed to take up space."], ["I speak to myself with kindness."], ["My feelings are valid, and they pass."],
      ["I am proud of the person I am becoming."], ["I choose peace over pressure."], ["I trust myself."],
      ["I am allowed to rest."], ["I forgive myself and begin again."]
    ]},
    study: { name: "Study, exams & career", note: "Focus, memory and exam calm", items: [
      ["I learn deeply, not just quickly."], ["My memory is clear and my recall is quick."], ["I walk into every exam calm and prepared."],
      ["One block at a time is enough."], ["Every page I read today is a step towards my goal."], ["I understand difficult ideas when I give them time."],
      ["My focus grows stronger every day."], ["I am becoming the professional I want to be."], ["Discipline today, freedom tomorrow."],
      ["I finish what I start."], ["Mistakes in practice make me sharper on the day."], ["I am prepared, capable and calm."]
    ]},
    calm: { name: "Calm", note: "Shown automatically on anxious or low days", items: [
      ["This feeling is a wave, and I can let it pass."], ["I breathe in calm and breathe out pressure."], ["I am safe in this moment."],
      ["I only need to do the next small thing."], ["I am gentle with myself today."], ["I have handled hard days before, and I will handle this one."]
    ]}
  },
  special: {
    portal: "My thoughts are seeds; I plant only what I want to grow.",
    P: ["I release what holds me back and honour how far I have come.", "I am grateful for every step of this cycle.", "What I have worked for is coming to light."],
    A: ["In the quiet dark, I choose what I want to build.", "I plant a clear intention and trust it to grow.", "This new cycle begins with one small, brave step."]
  },
  suggest: {
    habits: ["Drink 8 glasses of water","Exercise / gym","Wake up on time","Phone away while studying","Meditate","Journal","Read for 20 minutes","Sleep by 11 PM","Walk 5,000 steps","No screens after 10 PM","Eat fruit","Stretch for 10 minutes"],
    routine: [["07:00","07:30","Wake up, water, sunlight","Morning"],["07:30","07:45","Plan the day: top 3","Planning"],["07:45","08:45","Study block 1","Study"],["09:00","10:00","Exercise","Fixed"],["10:00","11:00","Get ready, breakfast","Fixed"],["11:00","11:50","Study block 2","Study"],["11:50","12:10","Break · walk, water","Break"],["12:10","13:00","Study block 3","Study"],["13:00","14:30","Lunch and rest","Rest"],["14:30","15:20","Study block 4","Study"],["15:20","17:30","Free time / errands","Free"],["18:30","19:30","Dinner","Fixed"],["19:30","19:50","Daily review · plan tomorrow","Planning"],["20:00","22:30","Unwind · family, hobbies","Free"],["22:30","23:00","Wind down · no screens","Free"],["23:00","","Sleep","Fixed"]],
    subjects: ["Subject 1","Subject 2","Revision","Practice questions","Notes"]
  }
};
