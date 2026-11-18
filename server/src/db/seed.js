import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Girija Cinema Hall Janakpur database seed...');

  // 1. Screens
  const audi1 = await prisma.screen.upsert({
    where: { id: 'girija-audi-1' },
    update: {},
    create: {
      id: 'girija-audi-1',
      name: 'Audi 1: Main Hall (Dolby Atmos 7.1)',
      soundSystem: 'Dolby Surround 7.1 with JBL Pro Audio',
      projection: 'Barco 2K Digital Cinema with Silver Curved Screen',
      capacity: 380
    }
  });

  const audi2 = await prisma.screen.upsert({
    where: { id: 'girija-audi-2' },
    update: {},
    create: {
      id: 'girija-audi-2',
      name: 'Audi 2: Gold Class (Qube Digital)',
      soundSystem: 'Qube Master Sound',
      projection: 'Christie Digital Laser',
      capacity: 220
    }
  });

  console.log(`✅ Screens configured: ${audi1.name}, ${audi2.name}`);

  // 2. Movies
  const movie1 = await prisma.movie.upsert({
    where: { id: 'mov-purna-bahadur' },
    update: {},
    create: {
      id: 'mov-purna-bahadur',
      title: 'Purna Bahadur Ko Sarangi',
      nepaliTitle: 'पूर्ण बहादुरको सारङ्गी',
      genre: ['Emotional', 'Drama', 'Family'],
      language: 'Nepali',
      formats: ['2D Digital', 'Dolby 7.1'],
      rating: 9.3,
      votes: '88.5K',
      duration: '2h 20m',
      ageRating: 'U',
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
      synopsis: 'The highest grossing film in Nepali cinema history. A heartbreaking and deeply moving story of an impoverished Gandharva father in rural Nepal who sacrifices everything to educate his beloved son.',
      director: 'Saroj Paudel',
      status: 'NOW_SHOWING'
    }
  });

  const movie2 = await prisma.movie.upsert({
    where: { id: 'mov-12-gaun' },
    update: {},
    create: {
      id: 'mov-12-gaun',
      title: '12 Gaun',
      nepaliTitle: '१२ गाउँ',
      genre: ['Action', 'Thriller', 'Revenge'],
      language: 'Nepali',
      formats: ['2D Digital', 'Dolby Atmos 7.1'],
      rating: 8.7,
      votes: '64.2K',
      duration: '2h 35m',
      ageRating: 'A (16+)',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: 'https://www.youtube.com/watch?v=kYJ7KjS7VbM',
      synopsis: 'An intense action thriller set across twelve remote Himalayan villages where an exile returns to bring justice against ruthless warlords.',
      director: 'Biraj Bhatta',
      status: 'NOW_SHOWING'
    }
  });

  const movie3 = await prisma.movie.upsert({
    where: { id: 'mov-pushpa-2' },
    update: {},
    create: {
      id: 'mov-pushpa-2',
      title: 'Pushpa 2: The Rule',
      nepaliTitle: 'पुष्पा २: द रुल',
      genre: ['Action', 'Crime', 'Drama'],
      language: 'Hindi (Nepali Subtitles)',
      formats: ['2D Digital', 'Dolby Atmos 7.1'],
      rating: 9.1,
      votes: '142K',
      duration: '3h 20m',
      ageRating: 'UA',
      posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1600&auto=format&fit=crop',
      trailerUrl: 'https://www.youtube.com/watch?v=g3JUbgOIxZc',
      synopsis: 'Pushpa Raj commands the red sandalwood syndicate with undisputed power while face-to-face against SP Bhanwar Singh Shekhawat in an explosive confrontation.',
      director: 'Sukumar',
      status: 'COMING_SOON'
    }
  });

  console.log(`✅ Movies seeded: ${movie1.title}, ${movie2.title}, ${movie3.title}`);

  // 3. Daily Shows for Today and Next 2 Days
  const showtimes = ['11:30 AM', '02:30 PM', '05:45 PM', '08:45 PM'];
  const today = new Date();

  for (let d = 0; d < 3; d++) {
    const showDate = new Date(today);
    showDate.setDate(today.getDate() + d);
    const dateStr = showDate.toISOString().split('T')[0];

    for (const time of showtimes) {
      await prisma.show.create({
        data: {
          movieId: movie1.id,
          screenId: audi1.id,
          date: dateStr,
          startTime: time
        }
      });

      await prisma.show.create({
        data: {
          movieId: movie2.id,
          screenId: audi2.id,
          date: dateStr,
          startTime: time
        }
      });
    }
  }

  console.log('✅ Daily show schedules generated for Audi 1 & Audi 2');

  // 4. Default Admin User
  const defaultPasswordHash = await bcrypt.hash('girija123', 10);
  await prisma.adminUser.upsert({
    where: { username: 'girija_admin' },
    update: {},
    create: {
      username: 'girija_admin',
      passwordHash: defaultPasswordHash,
      fullName: 'Girija Cinema Box Office Manager',
      role: 'SUPER_ADMIN'
    }
  });

  console.log('✅ Default Box Office Admin created: username="girija_admin", password="girija123"');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
