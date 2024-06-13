import {
  EmbedBuilder, ThreadChannel,
} from 'discord.js';
import stringSimilirity from 'string-similarity';

function findSimilarTitles(newTitle: string, posts: { title: string; id: string }[]): { title: string; id: string }[] {
  const similarTitles: {title: string, id: string}[] = [] as {title: string, id: string}[];
  const threshold = 0.50;

  posts.forEach((post) => {
    const similarity = stringSimilirity.compareTwoStrings(newTitle, post.title);
    if (similarity >= threshold) {
      similarTitles.push({
        title: post.title,
        id: post.id,
      });
    }
  });

  return similarTitles;
}

export default async (interaction: ThreadChannel) => {
  const threads = await interaction.parent!.threads.fetch();

  const posts = [] as { title: string; id: string }[];

  threads.threads.forEach((thread) => {
    posts.push({
      title: thread.name,
      id: thread.id,
    });
  });
  const t = findSimilarTitles(interaction.name, posts);

  const similarThreads = t.filter((thread) => thread.id !== interaction.id);
  const similarThreadsLinks = similarThreads.map((thread) => ({
    link: `https://discord.com/channels/${interaction.guild.id}/${thread.id}`,
    title: thread.title,
  }));

  if (similarThreadsLinks.length > 0) {
    const embed = new EmbedBuilder()
      .setTitle('Similar Threads')
      .setDescription(similarThreadsLinks.map((th) => `[${th.title}](${th.link})`).join('\n'))
      .setColor('#00AAFF')
      .setTimestamp();

    await interaction.send({ embeds: [embed] });
  }
};
