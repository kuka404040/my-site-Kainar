import { jsPDF } from 'jspdf';

// Kazakh-supporting canvas drawer
export async function generateKainarRulesPDF(
  studentName?: string,
  studentGroup?: string,
  studentTicket?: string,
  signDate?: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageCount = 7;
  const a4WidthMm = 210;
  const a4HeightMm = 297;
  
  // Calculate canvas dimensions at 150 DPI for elegant high-res outputs
  const dpi = 150;
  const scale = dpi / 25.4; // pixels per mm
  const canvasWidth = Math.round(a4WidthMm * scale);
  const canvasHeight = Math.round(a4HeightMm * scale);

  // Helper function to draw each page onto a canvas
  const drawPage = (pageNum: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Color Palette
    const navyBlue = '#113a70';
    const darkNavy = '#0f2440';
    const crimson = '#b91c1c';
    const lightBlueBg = '#eef2f7';
    const lightBlueBorder = '#cbd5e1';
    const darkGray = '#334155';
    const softGray = '#64748b';

    // 1. Draw top & bottom global borders and titles
    ctx.fillStyle = navyBlue;
    ctx.fillRect(0, 0, canvasWidth, 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ЖОҒАРЫ КОЛЛЕДЖ «ҚАЙНАР» — ҚАУІПСІЗДІК ЕРЕЖЕЛЕРІ', canvasWidth / 2, 42);

    // Global Footer
    ctx.fillStyle = navyBlue;
    ctx.fillRect(0, canvasHeight - 60, canvasWidth, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 16px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Жоғары Колледж «Қайнар» | Қауіпсіздік бөлімі', 60, canvasHeight - 25);

    ctx.textAlign = 'right';
    ctx.fillText(`Бет ${pageNum}`, canvasWidth - 60, canvasHeight - 25);

    // Reset layout alignments
    ctx.textAlign = 'left';

    // Helper text wrapper to handle Kazakh word breaks cleanly
    const wrapAndDrawText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, fontSize: number, isBold: boolean = false, color: string = darkGray): number => {
      ctx.fillStyle = color;
      ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSize}px "Inter", "Segoe UI", sans-serif`;
      
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    if (pageNum === 1) {
      // --- PAGE 1: COVER PAGE ---
      // Accent block
      ctx.fillStyle = navyBlue;
      ctx.fillRect(50, 150, canvasWidth - 100, 240);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ЖОҒАРЫ КОЛЛЕДЖ «ҚАЙНАР»', canvasWidth / 2, 285);

      // Crimson bold break line
      ctx.fillStyle = crimson;
      ctx.fillRect(50, 430, canvasWidth - 100, 12);

      // Subtitle
      ctx.fillStyle = darkNavy;
      ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('СТУДЕНТТЕРГЕ АРНАЛҒАН ҚАУІПСІЗДІК', canvasWidth / 2, 510);
      ctx.fillText('ЕРЕЖЕЛЕРІ', canvasWidth / 2, 565);

      // Intro paragraph
      ctx.textAlign = 'left';
      const introText = 'Осы ережелер жиынтығы барлық студенттердің, оқытушылардың және қызметкерлердің колледж аумағында қауіпсіз және тәртіпті жұмыс жасауын қамтамасыз ету мақсатында дайындалған. Ережелерді мұқият оқып, күнделікті тәжірибеде қолданыңыз.';
      wrapAndDrawText(introText, 80, 640, canvasWidth - 160, 36, 22, false, darkGray);

      // Table of Contents Box
      const tocHeaderY = 790;
      ctx.fillStyle = darkNavy;
      ctx.fillRect(80, tocHeaderY, canvasWidth - 160, 55);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Мазмұны', canvasWidth / 2, tocHeaderY + 38);

      const contents = [
        '1. Жалпы қауіпсіздік ережелері',
        '2. Өртке қарсы қауіпсіздік шаралары',
        '3. Электр қауіпсіздігі',
        '4. Денсаулық және санитарлық нормалар',
        '5. Зертхана мен кабинеттердегі қауіпсіздік',
        '6. Авариялық жағдайларда іс-әрекет',
        '7. Психологиялық қауіпсіздік және сыйластық',
        '8. Жауапкершілік және санкциялар',
      ];

      ctx.textAlign = 'left';
      contents.forEach((item, index) => {
        const itemY = tocHeaderY + 55 + (index * 48);
        ctx.fillStyle = index % 2 === 0 ? '#f8fafc' : lightBlueBg;
        ctx.fillRect(80, itemY, canvasWidth - 160, 48);

        // Border left and right
        ctx.strokeStyle = lightBlueBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(80, itemY, canvasWidth - 160, 48);

        ctx.fillStyle = darkNavy;
        ctx.font = '500 20px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(item, 110, itemY + 31);
      });

      // Board Approval info
      ctx.textAlign = 'center';
      ctx.fillStyle = softGray;
      ctx.font = 'italic 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Бекітілген: Колледж директоры | Күні: 2024 жыл', canvasWidth / 2, canvasHeight - 120);

    } else if (pageNum === 2) {
      // --- PAGE 2: GENERAL SAFETY & FIRE SAFETY (Part 1) ---
      // Section Header 1
      ctx.fillStyle = navyBlue;
      ctx.fillRect(70, 110, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('1. ЖАЛПЫ ҚАУІПСІЗДІК ЕРЕЖЕЛЕРІ', 90, 145);

      const subtitle1 = 'Колледж аумағында болған кезде әрбір студент мынадай жалпы ережелерді қатаң сақтауға міндетті:';
      wrapAndDrawText(subtitle1, 70, 195, canvasWidth - 140, 30, 19, false, softGray);

      const rules1 = [
        'Колледжге кірерде студенттік билетті немесе жеке куәлікті міндетті түрде көрсетіңіз. Бейтаныс адамдарды ғимаратқа кіргізуге тыйым салынады.',
        'Дәрісханаларда, дәліздерде және жалпы алаңдарда тиісті тәртіп пен үнсіздікті сақтаңыз; оқу процесіне кедергі келтірмеңіз.',
        'Ғимарат ішінде жүгіруге, дауыс шығарып ойнауға, басқа студенттерге кедергі болатын қозғалыстарға тыйым салынады.',
        'Бейтаныс немесе күдікті заттарды, бумаларды, сөмкелерді көрсеңіз — ұстамаңыз, ашпаңыз, дереу күзет қызметіне хабарлаңыз.',
        'Колледж мүлкіне зақым келтіруге, жазу-сызуға, бүлдіруге қатаң тыйым салынады.',
        'Эвакуация жоспарымен алдын ала танысып алыңыз. Барлық шығу есіктерінің орналасуын біліңіз.',
        'Колледж аумағына алкоголь, есірткі заттары, қару-жарақ, жарылғыш заттарды әкелуге қатаң тыйым салынады.'
      ];

      let currentY = 245;
      rules1.forEach((rule, idx) => {
        // Draw numbering block
        ctx.fillStyle = lightBlueBg;
        ctx.fillRect(70, currentY, 45, 45);
        ctx.strokeStyle = lightBlueBorder;
        ctx.strokeRect(70, currentY, 45, 45);

        ctx.fillStyle = navyBlue;
        ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, 70 + 22, currentY + 30);
        ctx.textAlign = 'left';

        // Draw text block
        const textY = wrapAndDrawText(rule, 140, currentY + 16, canvasWidth - 210, 27, 18, false, darkGray);
        currentY = Math.max(currentY + 60, textY + 15);
      });

      // Warning Callout Block
      ctx.fillStyle = 'rgba(185, 28, 28, 0.04)';
      ctx.fillRect(70, currentY, canvasWidth - 140, 85);
      ctx.strokeStyle = crimson;
      ctx.lineWidth = 2;
      ctx.strokeRect(70, currentY, canvasWidth - 140, 85);

      ctx.fillStyle = crimson;
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('НАЗАР АУДАРЫҢЫЗ:', 90, currentY + 35);
      ctx.fillStyle = darkGray;
      ctx.font = 'normal 17px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Күдікті жағдай немесе қауіп-қатер байқасаңыз, дереу күзет посына немесе администрацияға хабарлаңыз.', 90, currentY + 62);

      // Section Header 2
      currentY += 130;
      ctx.fillStyle = crimson;
      ctx.fillRect(70, currentY, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('2. ӨРТКЕ ҚАРСЫ ҚАУІПСІЗДІК ШАРАЛАРЫ', 90, currentY + 34);

      const subtitle2 = 'Өрт — ең ауыр апаттардың бірі. Алдын алу үшін мынадай ережелерді сақтаңыз:';
      wrapAndDrawText(subtitle2, 70, currentY + 83, canvasWidth - 140, 30, 19, false, softGray);

      const rules2 = [
        'Ғимарат ішінде шылым тартуға, ашық от жағуға, жалынды заттарды пайдалануға қатаң тыйым салынады.',
        'Өрт сөндіргіш аппараттардың, өрт крандарының орналасқан жерін біліңіз. Оларды басқа мақсатқа пайдалануға болмайды.',
        'Электр розеткаларын шамадан тыс жүктемеңіз; зақымдалған сымдарды пайдаланбаңыз.',
        'Өрт дабылы шыққан кезде барлық жұмысты тоқтатып, тыныш түрде ең жақын шығу есігімен шығыңыз. Лифтіні пайдаланбаңыз.'
      ];

      currentY += 125;
      rules2.forEach((rule, idx) => {
        ctx.fillStyle = 'rgba(185, 28, 28, 0.05)';
        ctx.fillRect(70, currentY, 45, 45);
        ctx.strokeStyle = '#fca5a5';
        ctx.strokeRect(70, currentY, 45, 45);

        ctx.fillStyle = crimson;
        ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, 70 + 22, currentY + 30);
        ctx.textAlign = 'left';

        const textY = wrapAndDrawText(rule, 140, currentY + 16, canvasWidth - 210, 27, 18, false, darkGray);
        currentY = Math.max(currentY + 60, textY + 15);
      });

    } else if (pageNum === 3) {
      // --- PAGE 3: FIRE SAFETY (Part 2) & EMERGENCY NUMBERS & ELECTRICAL SAFETY ---
      const rules2Cont = [
        'Эвакуация барысында жүгірмеңіз, бір-бірді итермеңіз, алдыңғы адамдарды бақылаңыз.',
        'Өрт дабылын әзіл ретінде іске қосуға болмайды — бұл заңмен қуғындалады.'
      ];

      let currentY = 110;
      rules2Cont.forEach((rule, idx) => {
        ctx.fillStyle = 'rgba(185, 28, 28, 0.05)';
        ctx.fillRect(70, currentY, 45, 45);
        ctx.strokeStyle = '#fca5a5';
        ctx.strokeRect(70, currentY, 45, 45);

        ctx.fillStyle = crimson;
        ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 5}`, 70 + 22, currentY + 30);
        ctx.textAlign = 'left';

        const textY = wrapAndDrawText(rule, 140, currentY + 16, canvasWidth - 210, 27, 18, false, darkGray);
        currentY = Math.max(currentY + 60, textY + 15);
      });

      // Quick numbers table
      currentY += 30;
      ctx.fillStyle = navyBlue;
      ctx.fillRect(70, currentY, canvasWidth - 140, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Қызмет', 100, currentY + 33);
      ctx.textAlign = 'right';
      ctx.fillText('Нөмір', canvasWidth - 100, currentY + 33);
      ctx.textAlign = 'left';

      const numbers = [
        { name: 'Өрт сөндіру қызметі', num: '101' },
         { name: 'Жедел медициналық жәрдем', num: '103' },
         { name: 'Полиция', num: '102' },
         { name: 'Колледж күзеті', num: 'Ресепшн' }
      ];

      numbers.forEach((info, index) => {
        const itemY = currentY + 50 + (index * 48);
        ctx.fillStyle = index % 2 === 0 ? '#f8fafc' : lightBlueBg;
        ctx.fillRect(70, itemY, canvasWidth - 140, 48);

        ctx.strokeStyle = lightBlueBorder;
        ctx.strokeRect(70, itemY, canvasWidth - 140, 48);

        ctx.fillStyle = darkNavy;
        ctx.font = 'bold 19px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(info.name, 100, itemY + 31);
        
        ctx.textAlign = 'right';
        ctx.fillStyle = crimson;
        ctx.fillText(info.num, canvasWidth - 100, itemY + 31);
        ctx.textAlign = 'left';
      });

      // Section Header 3
      currentY += 300;
      ctx.fillStyle = navyBlue;
      ctx.fillRect(70, currentY, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('3. ЭЛЕКТР ҚАУІПСІЗДІГІ', 90, currentY + 34);

      const rules3 = [
        'Зақымдалған немесе жарылған электр жабдықтарын, розеткаларды пайдаланбаңыз; дереу техниктерге хабарлаңыз.',
        'Суланған қолмен электр жабдықтарын ұстауға, розеткаға жалғауға тыйым салынады.',
        'Кабинеттен шыққанда жарық пен барлық электр жабдықтарын өшіріңіз.',
        'Бекітілмеген электр приборларын колледжге алып келуге болмайды.',
        'Электр соғу жағдайында: жапсырмаңыз — ток жүреді. Кернеуді ажыратып, медицинаға хабарлаңыз.'
      ];

      currentY += 80;
      rules3.forEach((rule, idx) => {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
        ctx.fillRect(70, currentY, 45, 45);
        ctx.strokeStyle = '#fcd34d';
        ctx.strokeRect(70, currentY, 45, 45);

        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, 70 + 22, currentY + 30);
        ctx.textAlign = 'left';

        const textY = wrapAndDrawText(rule, 140, currentY + 16, canvasWidth - 210, 27, 18, false, darkGray);
        currentY = Math.max(currentY + 60, textY + 15);
      });

    } else if (pageNum === 4) {
      // --- PAGE 4: HEALTH & HYGIENE & LAB RULES ---
      // Section Header 4
      let currentY = 110;
      ctx.fillStyle = '#16a34a'; // safe green
      ctx.fillRect(70, currentY, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('4. ДЕНСАУЛЫҚ ЖӘНЕ САНИТАРЛЫҚ НОРМАЛАР', 90, currentY + 34);

      const rules4 = [
        'Жұқпалы ауру белгілері (жөтел, дене қызуы) байқалса, колледжге келмеңіз. Дәрігерге хабарласып, куратор немесе деканатқа хабар беріңіз.',
        'Дәретхананы пайдаланғаннан кейін және тамақ алдында қолды сабынмен жақсылап жуыңыз.',
        'Тамақты тек арнайы асхана немесе кафетерияда жеңіз. Дәрісханаларда тамақтануға рұқсат жоқ.',
        'Қоқысты тек арнайы жәшіктерге тастаңыз. Еден мен жиһазда қоқыс қалдырмаңыз.',
        'Жедел медициналық жағдайда медпунктке немесе кезекшіге хабарлаңыз.',
        'Ортақ кеңістіктерде тазалыққа ерекше мән беріңіз.'
      ];

      currentY += 80;
      rules4.forEach((rule, idx) => {
        ctx.fillStyle = 'rgba(22, 163, 74, 0.06)';
        ctx.fillRect(70, currentY, 45, 45);
        ctx.strokeStyle = '#86efac';
        ctx.strokeRect(70, currentY, 45, 45);

        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, 70 + 22, currentY + 30);
        ctx.textAlign = 'left';

        const textY = wrapAndDrawText(rule, 140, currentY + 16, canvasWidth - 210, 27, 18, false, darkGray);
        currentY = Math.max(currentY + 60, textY + 15);
      });

      // General checkmark detail info
      ctx.fillStyle = '#f0fdf4';
      ctx.fillRect(70, currentY, canvasWidth - 140, 70);
      ctx.strokeStyle = '#86efac';
      ctx.strokeRect(70, currentY, canvasWidth - 140, 70);

      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('✓ Медпункт ғимараттың 1-қабатында орналасқан. Жұмыс уақыты: Дүйсенбі–Жұма, 08:00–17:00.', 90, currentY + 41);

      // Section Header 5
      currentY += 130;
      ctx.fillStyle = navyBlue;
      ctx.fillRect(70, currentY, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('5. ЗЕРТХАНА МЕН КАБИНЕТТЕРДЕГІ ҚАУІПСІЗДІК', 90, currentY + 34);

      const rules5 = [
        'Зертханаға кіруден бұрын оқытушыдан нұсқаулық алыңыз. Нұсқаулықсыз тәжірибе жасауға болмайды.',
        'Химиялық реагенттермен жұмыс кезінде арнайы қорғаныс жабдықтарын (қолғап, көзілдірік, халат) міндетті түрде киіңіз.',
        'Химиялық заттарды аузыңызбен тартуға, иіскеуге, терімен тікелей жанасуға тыйым салынады.',
        'Компьютерлік кабинеттерде тамақ пен сусын ішуге, жабдықты өз бетімен ашуға тыйым салынады.',
        'Зертхана жабдықтары мен аспаптарын рұқсатсыз алуға немесе пайдалануға болмайды.',
        'Жұмыс аяқталған соң жұмыс орнын тазалаңыз, жабдықтарды орнына қойыңыз, электрді өшіріңіз.'
      ];

      currentY += 80;
      rules5.forEach((rule, idx) => {
        ctx.fillStyle = lightBlueBg;
        ctx.fillRect(70, currentY, 45, 45);
        ctx.strokeStyle = lightBlueBorder;
        ctx.strokeRect(70, currentY, 45, 45);

        ctx.fillStyle = navyBlue;
        ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, 70 + 22, currentY + 30);
        ctx.textAlign = 'left';

        const textY = wrapAndDrawText(rule, 140, currentY + 16, canvasWidth - 210, 27, 18, false, darkGray);
        currentY = Math.max(currentY + 60, textY + 15);
      });

    } else if (pageNum === 5) {
      // --- PAGE 5: LAB (Part 2) & SPECIAL INCIDENT ALGORITHM TABLE ---
      let currentY = 110;
      const rule5Cont = 'Жарақат болса — дереу оқытушыға хабарлаңыз. Бірінші медициналық жәрдем жиынтығы кабинетте.';
      
      ctx.fillStyle = lightBlueBg;
      ctx.fillRect(70, currentY, 45, 45);
      ctx.strokeStyle = lightBlueBorder;
      ctx.strokeRect(70, currentY, 45, 45);

      ctx.fillStyle = navyBlue;
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('7', 70 + 22, currentY + 30);
      ctx.textAlign = 'left';

      currentY = wrapAndDrawText(rule5Cont, 140, currentY + 28, canvasWidth - 210, 27, 18, false, darkGray);

      currentY += 20;
      ctx.fillStyle = 'rgba(185, 28, 28, 0.04)';
      ctx.fillRect(70, currentY, canvasWidth - 140, 70);
      ctx.strokeStyle = crimson;
      ctx.lineWidth = 2;
      ctx.strokeRect(70, currentY, canvasWidth - 140, 70);

      ctx.fillStyle = crimson;
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('НАЗАР АУДАРЫҢЫЗ:', 90, currentY + 41);
      ctx.fillStyle = darkGray;
      ctx.font = 'normal 17px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Химиялық зат теріге немесе көзге тисе — дереу мол сумен шайыңыз (15 минут) және мердпунктке хабарлаңыз.', 280, currentY + 41);

      // Section Header 6 - Emergency Plan
      currentY += 130;
      ctx.fillStyle = '#f97316'; // Emergency Orange
      ctx.fillRect(70, currentY, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('6. АВАРИЯЛЫҚ ЖАҒДАЙЛАРДА ІС-ӘРЕКЕТ АЛГОРИТМІ', 90, currentY + 34);

      currentY += 75;

      // Draw custom interactive table
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(70, currentY, 260, 48); // Column 1 header
      ctx.fillRect(331, currentY, canvasWidth - 401, 48); // Column 2 header

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 19px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Жағдай', 70 + 130, currentY + 31);
      ctx.fillText('Іс-қимыл', 331 + (canvasWidth - 401) / 2, currentY + 31);
      ctx.textAlign = 'left';

      const tableData = [
        { c1: 'Өрт шықса', c2: 'Дабыл қосыңыз — барлығын ескертіңіз — баспалдақпен шығыңыз — 101-ге хабарлаңыз — жинау нүктесінде тіркеліңіз' },
        { c1: 'Жер сілкінісі болса', c2: 'Еденге жатыңыз — бастыңызды жабыңыз — берік жиһаздың жанына барыңыз — сілкіністен кейін сыртқа шығыңыз' },
        { c1: 'Адам жарақат алса', c2: 'Медпунктке немесе 103-ке хабарлаңыз — жарақатқа тимеңіз — кезекші маманды шақырыңыз' },
        { c1: 'Күдікті зат табылса', c2: 'Ұстамаңыз — аймақты босатыңыз — күзетке хабарлаңыз — 102-ге хабарлаңыз' },
        { c1: 'Медициналық шұғыл жағдай', c2: '103-ке хабарлаңыз — медпунктті шақырыңыз — науқасты жылы ұстаңыз' },
      ];

      tableData.forEach((row, index) => {
        const rowY = currentY + 48 + (index * 92);
        ctx.fillStyle = index % 2 === 0 ? '#fafaf9' : '#fff7ed';
        ctx.fillRect(70, rowY, 260, 92);
        ctx.fillRect(331, rowY, canvasWidth - 401, 92);

        // draw borders
        ctx.strokeStyle = '#fed7aa';
        ctx.strokeRect(70, rowY, 260, 92);
        ctx.strokeRect(331, rowY, canvasWidth - 401, 92);

        ctx.fillStyle = '#c2410c';
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(row.c1, 85, rowY + 50);

        ctx.fillStyle = darkGray;
        ctx.font = 'normal 16px "Inter", "Segoe UI", sans-serif';
        wrapAndDrawText(row.c2, 350, rowY + 32, canvasWidth - 430, 24, 16, false, darkGray);
      });

    } else if (pageNum === 6) {
      // --- PAGE 6: PSYCHOLOGY & RESPONSIBILITY / SANCTIONS ---
      // Section Header 7 - Psychology
      let currentY = 110;
      ctx.fillStyle = navyBlue;
      ctx.fillRect(70, currentY, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('7. ПСИХОЛОГИЯЛЫҚ ҚАУІПСІЗДІК ЖӘНЕ СЫЙЛАСТЫҚ МӘДЕНИЕТІ', 90, currentY + 34);

      const subtitle7 = 'Колледж — барлық студенттер үшін қауіпсіз, сыйластыққа негізделген орта болуға тиіс:';
      wrapAndDrawText(subtitle7, 70, currentY + 80, canvasWidth - 140, 28, 19, false, softGray);

      const rules7 = [
        'Кез-келген нысандағы кемсітуге, мазақтауға, қорлауға, дискриминацияға қатаң тыйым салынады.',
        'Алалаушылық немесе психологиялық зорлық-зомбылық жағдайы туралы куратор немесе психолог-кеңесшіге хабарлаңыз.',
        'Интернет пен әлеуметтік желілерде де сыйластық нормаларын сақтаңыз. Кибербуллинг — тәртіп бұзушылық.',
        'Ашуланшақтық немесе жанжал болған жағдайда — медиация бөлмесіне немесе психологқа жүгініңіз.',
        'Өзіңіздің немесе басқа студенттің психологиялық күйзелісі туралы бірден кеңесшіге хабарлаңыз.',
        'Топта жақсы ұжымдық рух қалыптастырыңыз: бір-біріңізге қолдау көрсетіңіз.'
      ];

      currentY += 130;
      rules7.forEach((rule, idx) => {
        ctx.fillStyle = lightBlueBg;
        ctx.fillRect(70, currentY, 45, 45);
        ctx.strokeStyle = lightBlueBorder;
        ctx.strokeRect(70, currentY, 45, 45);

        ctx.fillStyle = navyBlue;
        ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${idx + 1}`, 70 + 22, currentY + 30);
        ctx.textAlign = 'left';

        const textY = wrapAndDrawText(rule, 140, currentY + 16, canvasWidth - 210, 27, 18, false, darkGray);
        currentY = Math.max(currentY + 60, textY + 15);
      });

      // Psychology office box
      ctx.fillStyle = '#f0fdf4';
      ctx.fillRect(70, currentY, canvasWidth - 140, 65);
      ctx.strokeStyle = '#86efac';
      ctx.strokeRect(70, currentY, canvasWidth - 140, 65);

      ctx.fillStyle = '#16a34a';
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('✓ Психолог-кеңесші кабинеті: 2-қабат, №214 бөлме. Анонимді кеңес алуға болады.', 95, currentY + 39);

      // Section Header 8 - Sanctions
      currentY += 110;
      ctx.fillStyle = crimson;
      ctx.fillRect(70, currentY, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('8. ЖАУАПКЕРШІЛІК ЖӘНЕ САНКЦИЯЛАР', 90, currentY + 34);

      currentY += 75;

      // Table Sanctions
      ctx.fillStyle = crimson;
      ctx.fillRect(70, currentY, 430, 48); // Col 1 Header
      ctx.fillRect(501, currentY, canvasWidth - 571, 48); // Col 2 Header

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Бұзушылық түрі', 70 + 215, currentY + 31);
      ctx.fillText('Қолданылатын шара', 501 + (canvasWidth - 571) / 2, currentY + 31);
      ctx.textAlign = 'left';

      const sanctions = [
        { type: 'Ережелерді алғаш рет бұзу', action: 'Ауызша ескерту; куратор хабардар етіледі' },
        { type: 'Қайталай бұзу', action: 'Жазбаша сөгіс; ата-анаға / қамқоршыға хабарлау' },
        { type: 'Мүлікті бүлдіру / зиян келтіру', action: 'Материалдық жауапкершілік; жөндеу шығынын өтеу' },
        { type: 'Өрт / химиялық / электр қауіпсіздігін бұзу', action: 'Ауыр тәртіптік жаза; ҚР заңы бойынша жауапкершілік' },
        { type: 'Зорлық-зомбылық, қару, есірткі', action: 'Шығарып жіберу + полицияға хабарлау' }
      ];

      sanctions.forEach((row, index) => {
        const rowY = currentY + 48 + (index * 68);
        ctx.fillStyle = index % 2 === 0 ? '#fef2f2' : '#ffffff';
        ctx.fillRect(70, rowY, 430, 68);
        ctx.fillRect(501, rowY, canvasWidth - 571, 68);

        ctx.strokeStyle = '#fee2e2';
        ctx.strokeRect(70, rowY, 430, 68);
        ctx.strokeRect(501, rowY, canvasWidth - 571, 68);

        ctx.fillStyle = crimson;
        ctx.font = 'bold 17px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(row.type, 90, rowY + 40);

        ctx.fillStyle = darkGray;
        ctx.font = 'normal 16px "Inter", "Segoe UI", sans-serif';
        wrapAndDrawText(row.action, 520, rowY + 28, canvasWidth - 560, 22, 16, false, darkGray);
      });

    } else if (pageNum === 7) {
      // --- PAGE 7: SIGNATURE / ACKNOWLEDGEMENT ---
      // Big Callout Signature Box
      let currentY = 130;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(70, currentY, canvasWidth - 140, 110);
      ctx.strokeStyle = lightBlueBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(70, currentY, canvasWidth - 140, 110);

      ctx.fillStyle = darkNavy;
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ТАНЫСТЫМ ЖӘНЕ ОРЫНДАУҒА МІНДЕТТЕНЕМІН', canvasWidth / 2, currentY + 45);

      ctx.fillStyle = darkGray;
      ctx.font = 'normal 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Мен, төменде аты-жөні жазылған студент, «Жоғары Колледж Қайнар»-дың', canvasWidth / 2, currentY + 80);
      ctx.fillText('қауіпсіздік ережелерімен таныстым және оларды толық орындауға міндеттенемін.', canvasWidth / 2, currentY + 110);
      ctx.textAlign = 'left';

      // Input signature lines
      currentY += 160;
      const signatureBlocks = [
        { label: 'Аты-жөні (толық):', placeholder: '_____________________________________________________________________', value: studentName },
        { label: 'Топ / Мамандық:', placeholder: '_____________________________________________________________________', value: studentGroup },
        { label: 'Студенттік билет №:', placeholder: '_____________________________________________________________________', value: studentTicket },
        { label: 'Қол қойған күні:', placeholder: '_____________________________________________________________________', value: signDate },
        { label: 'Қолы:', placeholder: '_____________________________________________________________________', value: studentName ? 'ТАПСЫРДЫ / САНДЫҚ ҚОЛ' : '' },
      ];

      signatureBlocks.forEach((field) => {
        ctx.fillStyle = darkNavy;
        ctx.font = 'bold 19px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(field.label, 100, currentY + 40);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'normal 19px monospace';
        ctx.fillText(field.placeholder, 350, currentY + 40);

        if (field.value) {
          ctx.fillStyle = '#0f172a'; // charcoal print fill color
          ctx.font = 'italic bold 19px "Inter", "Segoe UI", sans-serif';
          ctx.fillText(field.value, 360, currentY + 35);
        }

        currentY += 80;
      });

      // Final signature stamps and web reference
      ctx.fillStyle = softGray;
      ctx.font = 'normal 17px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Жоғары Колледж «Қайнар» | Қауіпсіздік және тәртіп бөлімі | www.kaynar.edu.kz', canvasWidth / 2, currentY + 120);
    }

    return canvas;
  };

  // Stagger render call to build each PDF page sequentially and stitch safely into jsPDF container
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const canvas = drawPage(pageNum);
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Append to document container
    if (pageNum > 1) {
      doc.addPage();
    }
    doc.addImage(imgData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm, undefined, 'FAST');
  }

  // Release and trigger automated download
  doc.save('Kainar_College_Safety_Rules.pdf');
}

export async function generateKainarTeacherRulesPDF(): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageCount = 4;
  const a4WidthMm = 210;
  const a4HeightMm = 297;
  
  // Calculate canvas dimensions at 150 DPI for elegant high-res outputs
  const dpi = 150;
  const scale = dpi / 25.4; // pixels per mm
  const canvasWidth = Math.round(a4WidthMm * scale);
  const canvasHeight = Math.round(a4HeightMm * scale);

  // Helper function to draw each page onto a canvas
  const drawPage = (pageNum: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Color Palette
    const navyBlue = '#113a70';
    const darkNavy = '#0f2440';
    const crimson = '#b91c1c';
    const lightBlueBg = '#eef2f7';
    const lightBlueBorder = '#cbd5e1';
    const darkGray = '#334155';
    const softGray = '#64748b';

    // Global Footer - different text for Teacher's guide
    const drawFooter = () => {
      ctx.fillStyle = navyBlue;
      ctx.fillRect(0, canvasHeight - 60, canvasWidth, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 16px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Жоғары Колледж «Қайнар» | Қауіпсіздік және тәртіп бөлімі', 60, canvasHeight - 25);

      ctx.textAlign = 'right';
      ctx.fillText(`Бет ${pageNum} / ${pageCount}`, canvasWidth - 60, canvasHeight - 25);
      ctx.textAlign = 'left';
    };

    // Helper text wrapper to handle Kazakh word breaks cleanly
    const wrapAndDrawText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, fontSize: number, isBold: boolean = false, color: string = darkGray): number => {
      ctx.fillStyle = color;
      ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSize}px "Inter", "Segoe UI", sans-serif`;
      
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    if (pageNum === 1) {
      // --- PAGE 1: COVER ---
      // Draw top header banner
      ctx.fillStyle = navyBlue;
      ctx.fillRect(0, 0, canvasWidth, 120);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ЖОҒАРЫ КОЛЛЕДЖ «ҚАЙНАР»', canvasWidth / 2, 72);

      // Main Title centered
      ctx.fillStyle = darkNavy;
      ctx.font = 'extrabold 52px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ҚАУІПСІЗДІК ЕРЕЖЕЛЕРІ', canvasWidth / 2, 240);

      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 30px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Оқытушылар мен студенттерге арналған нұсқаулық', canvasWidth / 2, 300);

      // Single blue horizontal line
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(80, 360, canvasWidth - 160, 4);

      // Info/Description box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(80, 420, canvasWidth - 160, 160);
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(80, 420, canvasWidth - 160, 160);

      ctx.textAlign = 'left';
      wrapAndDrawText(
        'Осы құжат «Қайнар» жоғары колледжінің барлық оқытушылары мен студенттері үшін міндетті болып табылатын қауіпсіздік ережелерін қамтиды. Ережелерді мұқият оқып, күнделікті оқу процесінде қатаң сақтаңыз.',
        110,
        465,
        canvasWidth - 220,
        32,
        20,
        false,
        darkGray
      );

      // Emergency Contacts Grid (Red, Green, Blue, Brown/Gold cells)
      const gridY = 660;
      const colWidth = (canvasWidth - 160) / 4;
      const cellHeight = 160;

      const emergencyCols = [
        { label: 'Өрт сөндіру қызметі', val: '101', bg: '#b91c1c' },
        { label: 'Жедел жәрдем', val: '103', bg: '#16a34a' },
        { label: 'Полиция', val: '102', bg: '#1e40af' },
        { label: 'Колледж күзеті', val: 'Ішкі: 100', bg: '#78350f' }
      ];

      emergencyCols.forEach((col, idx) => {
        const startX = 80 + idx * colWidth;
        
        ctx.fillStyle = col.bg;
        ctx.fillRect(startX, gridY, colWidth - 2, cellHeight / 2);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, gridY, colWidth - 2, cellHeight / 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(col.label, startX + colWidth / 2, gridY + 45);

        ctx.fillStyle = col.bg;
        ctx.fillRect(startX, gridY + cellHeight / 2, colWidth - 2, cellHeight / 2);
        ctx.strokeRect(startX, gridY + cellHeight / 2, colWidth - 2, cellHeight / 2);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(col.val, startX + colWidth / 2, gridY + cellHeight / 2 + 55);
      });

      // Bottom approver line
      ctx.textAlign = 'center';
      ctx.fillStyle = softGray;
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Бекітілген: «Қайнар» жоғары колледжінің директоры | 2024–2025 оқу жылы', canvasWidth / 2, canvasHeight - 140);

      drawFooter();
    } else if (pageNum === 2) {
      // --- PAGE 2: TEACHERS OBLIGATIONS ---
      ctx.fillStyle = navyBlue;
      ctx.fillRect(70, 100, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('1. ОҚЫТУШЫЛАРҒА АРНАЛҒАН МІНДЕТТІ ЕРЕЖЕЛЕР', 90, 134);

      // Section 1.1: Сабақ басталмас бұрын
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('1.1 Сабақ басталмас бұрын', 70, 190);

      const items1_1 = [
        'Дәрісхананың барлық жарықтандыру, желдету жүйелерін тексеріңіз.',
        'Авариялық шығу есіктерінің бос, ашылатынын тексеріңіз.',
        'Өрт сөндіргіштің жарамдылық мерзімін және орналасқан жерін тексеріңіз.',
        'Электр жабдықтарын (проектор, компьютер) тексеріп, ақаулы болса пайдаланбаңыз.',
        'Дәрісхана журналын өзіңізбен бірге алыңыз – авария кезінде студенттерді тізімнен тексеру үшін.'
      ];

      let currentY = 220;
      items1_1.forEach((text) => {
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('▸', 70, currentY + 18);
        
        currentY = wrapAndDrawText(text, 90, currentY + 18, canvasWidth - 160, 26, 18, false, darkGray) + 8;
      });

      // Section 1.2: Сабақ барысында
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('1.2 Сабақ барысында', 70, currentY + 15);

      const items1_2 = [
        'Студенттердің дәрісханадан рұқсатсыз кетуіне жол бермеңіз.',
        'Химиялық немесе физикалық тәжірибелер кезінде қорғаныш жабдықтарын пайдаланыңыз.',
        'Авариялық шығу жолдарын студенттерге алдын ала көрсетіңіз.',
        'Ешқандай жабдықты қараусыз қосулы күйде қалдырмаңыз.',
        'Студент жарақат алған жағдайда – алдымен алғашқы көмек, содан кейін 103-ке қоңырау.'
      ];

      currentY += 45;
      items1_2.forEach((text) => {
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('▸', 70, currentY + 18);
        
        currentY = wrapAndDrawText(text, 90, currentY + 18, canvasWidth - 160, 26, 18, false, darkGray) + 8;
      });

      // Section 1.3: Төтенше жағдай кезінде эвакуациялау тәртібі
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('1.3 Төтенше жағдай кезінде эвакуациялау тәртібі', 70, currentY + 20);

      const tableData = [
        { step: '1-қадам', text: 'Сабақты дереу тоқтатыңыз, барлық студенттерге сабырлы дауыспен хабарлаңыз.' },
        { step: '2-қадам', text: 'Журналды алып, студенттерді ең жақын авариялық шығу есігіне бастаңыз.' },
        { step: '3-қадам', text: 'Лифтіні пайдаланбаңыз – тек баспалдақпен шығыңыз.' },
        { step: '4-қадам', text: 'Жиналу нүктесіне жеткізіп, журнал бойынша студенттерді санаңыз.' },
        { step: '5-қадам', text: 'Нәтижені колледж администрациясы мен авариялық қызметке хабарлаңыз.' }
      ];

      currentY += 45;
      tableData.forEach((row, idx) => {
        const rowY = currentY;
        ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        ctx.fillRect(70, rowY, 150, 42);
        ctx.fillRect(221, rowY, canvasWidth - 291, 42);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(70, rowY, 150, 42);
        ctx.strokeRect(221, rowY, canvasWidth - 291, 42);

        ctx.fillStyle = navyBlue;
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(row.step, 90, rowY + 27);

        ctx.fillStyle = darkGray;
        ctx.font = 'normal 17px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(row.text, 240, rowY + 27);

        currentY += 42;
      });

      // Warning Callout Block
      currentY += 25;
      ctx.fillStyle = 'rgba(185, 28, 28, 0.04)';
      ctx.fillRect(70, currentY, canvasWidth - 140, 65);
      ctx.strokeStyle = crimson;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(70, currentY, canvasWidth - 140, 65);

      ctx.fillStyle = crimson;
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ Оқытушы эвакуация аяқталғанша дәрісхана ішінде студент қалмағанын тексеруге міндетті!', canvasWidth / 2, currentY + 38);
      ctx.textAlign = 'left';

      // Section 1.4: Алғашқы медициналық көмек
      currentY += 95;
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('1.4 Алғашқы медициналық көмек', 70, currentY);

      const items1_4 = [
        'Барлық оқытушылар алғашқы медициналық көмек дағдыларын меңгеруі тиіс (жыл сайынғы оқыту өтеді).',
        'Дәрісханадағы алғашқы көмек жәшігінің орнын білу және мерзімі өткен дәрі-дәрмектерді ауыстыру.',
        'Жүрек-өкпе жансарту (ЖӨЖ) техникасын білу – жыл сайын тренинг міндетті.',
        'Жарақат, есінен тану, аллергиялық реакция жағдайларында 103 (жедел жәрдем) шақырыңыз.',
        'Медициналық оқиға туралы актіні толтырып, колледж медбикесіне тапсырыңыз.'
      ];

      currentY += 15;
      items1_4.forEach((text) => {
        ctx.fillStyle = '#dc2626'; // Red plus
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('✚', 70, currentY + 18);
        
        currentY = wrapAndDrawText(text, 95, currentY + 18, canvasWidth - 165, 26, 18, false, darkGray) + 8;
      });

      drawFooter();
    } else if (pageNum === 3) {
      // --- PAGE 3: STUDENTS OBLIGATIONS ---
      ctx.fillStyle = navyBlue;
      ctx.fillRect(70, 100, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('2. СТУДЕНТТЕРГЕ АРНАЛҒАН ҚАУІПСІЗДІК ЕРЕЖЕЛЕРІ', 90, 134);

      // Section 2.1: Жалпы тәртіп
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('2.1 Жалпы тәртіп ережелері', 70, 190);

      const items2_1 = [
        'Колледж ғимаратына кіргенде жеке куәлікті немесе студент билетін көрсетіңіз.',
        'Дәрісхана, зертхана, спорт залда жүгіруге, айқайлауға тыйым салынады.',
        'Авариялық шығу есіктерін бөгемеңіз, алдарына зат қоймаңыз.',
        'Ғимаратта темекі шекпеңіз – арнайы белгіленген аймақтан тыс тыйым салынады.',
        'Оқу орнына алкоголь, есірткі заттарын, жарылғыш, өртке қауіпті заттарды алып келуге қатаң тыйым.'
      ];

      let currentY = 220;
      items2_1.forEach((text) => {
        ctx.fillStyle = darkNavy;
        ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('●', 70, currentY + 18);
        
        currentY = wrapAndDrawText(text, 90, currentY + 18, canvasWidth - 160, 26, 18, false, darkGray) + 8;
      });

      // Section 2.2: Өрт қауіпсіздігі
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('2.2 Өрт қауіпсіздігі', 70, currentY + 15);

      const items2_2 = [
        'Өрт сигналы естілгенде дереу заттарыңызды қалдырып, ең жақын шығу есігіне беттеңіз.',
        'Лифтіні пайдаланбаңыз – баспалдақпен ғана шығыңыз.',
        'Дұрыс жиналу нүктесін оқу жылының басында-ақ біліңіз.',
        'Өрт сөндіргішті ойынға, басқа мақсатқа пайдалануға тыйым.',
        'Кез келген өрт белгісін (түтін, жалын, күйген иіс) байқасаңыз – оқытушыға немесе күзетке хабарлаңыз.'
      ];

      currentY += 40;
      items2_2.forEach((text) => {
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('🗲', 70, currentY + 18);
        
        currentY = wrapAndDrawText(text, 90, currentY + 18, canvasWidth - 160, 26, 18, false, darkGray) + 8;
      });

      // Section 2.3: Зертхана қауіпсіздігі
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('2.3 Зертхана және арнайы кабинеттердегі қауіпсіздік', 70, currentY + 15);

      const items2_3 = [
        'Химия зертханасында оқытушының рұқсатынсыз ешқандай реакция жасамаңыз.',
        'Қорғаныш көзілдірігін, қолғапты және халатты міндетті түрде киіңіз.',
        'Химиялық заттарды иіскемеңіз, дәмін татпаңыз, тікелей ұстамаңыз.',
        'Компьютер кабинетінде ішімдік, тамақ ішуге тыйым салынады.',
        'Спорт залда жаттығу алдында жылыну жаттығуларын орындаңыз, жарақаттан сақтаныңыз.'
      ];

      currentY += 40;
      items2_3.forEach((text) => {
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('⚗', 70, currentY + 18);
        
        currentY = wrapAndDrawText(text, 90, currentY + 18, canvasWidth - 160, 26, 18, false, darkGray) + 8;
      });

      // Section 2.4: Жеке қауіпсіздік
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('2.4 Жеке қауіпсіздік', 70, currentY + 15);

      const items2_4 = [
        'Колледж территориясында бейтаныс адамдармен жалғыз жүрмеңіз.',
        'Жеке заттарыңызды, электрондық жабдықтарыңызды қараусыз қалдырмаңыз.',
        'Алаяқтық, қорқытып алу жағдайын байқасаңыз – 102 (полиция) немесе college күзетіне хабарлаңыз.',
        'Психологиялық немесе физикалық зорлық-зомбылық жағдайында колледж психологына жүгіріңіз.'
      ];

      currentY += 40;
      items2_4.forEach((text) => {
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('▸', 70, currentY + 18);
        
        currentY = wrapAndDrawText(text, 90, currentY + 18, canvasWidth - 160, 26, 18, false, darkGray) + 8;
      });

      // Warning Box bottom
      currentY += 20;
      ctx.fillStyle = 'rgba(185, 28, 28, 0.04)';
      ctx.fillRect(70, currentY, canvasWidth - 140, 65);
      ctx.strokeStyle = crimson;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(70, currentY, canvasWidth - 140, 65);

      ctx.fillStyle = crimson;
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ Кез келген авариялық жағдайда оқытушының нұсқауларын мүлтіксіз орындаңыз!', canvasWidth / 2, currentY + 38);
      ctx.textAlign = 'left';

      drawFooter();
    } else if (pageNum === 4) {
      // --- PAGE 4: PLAN & LIABILITY & SIGNATURES ---
      ctx.fillStyle = '#16a34a'; // Green
      ctx.fillRect(70, 90, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('3. ЖИНАЛУ НҮКТЕЛЕРІ МЕН ЭВАКУАЦИЯЛАУ ЖОСПАРЫ', 90, 124);

      const mapSubtitle = 'Колледж ғимаратынан эвакуациялау кезінде әрбір қабаттың студенттері белгіленген жиналу нүктелеріне бағытталады. Жиналу нүктелері ғимараттан кемінде 50 метр қашықтықта орналасқан.';
      let currentY = wrapAndDrawText(mapSubtitle, 70, 175, canvasWidth - 140, 28, 17, false, softGray) + 15;

      // Draw Table of Assembly points
      ctx.fillStyle = navyBlue;
      ctx.fillRect(70, currentY, 120, 48);
      ctx.fillRect(191, currentY, 260, 48);
      ctx.fillRect(452, currentY, 280, 48);
      ctx.fillRect(733, currentY, canvasWidth - 803, 48);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Қабат', 70 + 60, currentY + 31);
      ctx.fillText('Авариялық шығу', 191 + 130, currentY + 31);
      ctx.fillText('Жиналу нүктесі', 452 + 140, currentY + 31);
      ctx.fillText('Жауапты', 733 + (canvasWidth - 803) / 2, currentY + 31);
      ctx.textAlign = 'left';

      const tableRows = [
        { floor: '1-қабат', path: 'Негізгі кіреберіс, Оңтүстік есік', point: 'А нүктесі – оң жақ алаң', person: 'Кезекші оқытушы' },
        { floor: '2-қабат', path: 'Шығыс баспалдақ, Батыс баспалдақ', point: 'Б нүктесі – стадион алаңы', person: 'Кезекші оқытушы' },
        { floor: '3-қабат', path: 'Шығыс баспалдақ', point: 'Б нүктесі – стадион алаңы', person: 'Кезекші оқытушы' },
        { floor: '4-қабат', path: 'Батыс баспалдақ', point: 'В нүктесі – оқу корпусы алдындағы саябақ', person: 'Кезекші оқытушы' }
      ];

      tableRows.forEach((row, idx) => {
        const rowY = currentY + 48 + (idx * 80);
        ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        ctx.fillRect(70, rowY, 120, 80);
        ctx.fillRect(191, rowY, 260, 80);
        ctx.fillRect(452, rowY, 280, 80);
        ctx.fillRect(733, rowY, canvasWidth - 803, 80);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(70, rowY, 120, 80);
        ctx.strokeRect(191, rowY, 260, 80);
        ctx.strokeRect(452, rowY, 280, 80);
        ctx.strokeRect(733, rowY, canvasWidth - 803, 80);

        ctx.fillStyle = navyBlue;
        ctx.font = 'bold 17px "Inter", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(row.floor, 70 + 60, rowY + 45);

        ctx.fillStyle = darkGray;
        ctx.font = 'normal 15px "Inter", "Segoe UI", sans-serif';
        wrapAndDrawText(row.path, 205, rowY + 28, 235, 22, 15, false, darkGray);
        wrapAndDrawText(row.point, 465, rowY + 28, 255, 22, 15, false, darkGray);
        ctx.textAlign = 'center';
        ctx.fillText(row.person, 733 + (canvasWidth - 803) / 2, rowY + 45);
        ctx.textAlign = 'left';
      });

      // Section 4
      currentY = currentY + 48 + (tableRows.length * 80) + 25;
      ctx.fillStyle = '#6b21a8'; // Purple
      ctx.fillRect(70, currentY, canvasWidth - 140, 53);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('4. ЖАУАПКЕРШІЛІК ЖӘНЕ ТӘРТІПТІК ШАРАЛАР', 90, currentY + 34);

      // 4.1 Оқытушының жауапкершілігі
      ctx.fillStyle = '#6b21a8';
      ctx.font = 'bold 19px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('4.1 Оқытушының жауапкершілігі', 70, currentY + 90);

      const items4_1 = [
        'Қауіпсіздік нұсқамаларын жыл басында барлық студенттерге өткізу.',
        'Кезекті тексеруді жүргізу және нәтижелерді журналға тіркеу.',
        'Авариялық жағдайды 24 сағат ішінде жазбаша түрде ұсынбаса – тәртіптік жаза қолданылады.'
      ];

      currentY += 105;
      items4_1.forEach((text) => {
        ctx.fillStyle = '#6b21a8';
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('■', 70, currentY + 18);
        currentY = wrapAndDrawText(text, 90, currentY + 18, canvasWidth - 160, 24, 17, false, darkGray) + 5;
      });

      // 4.2 Студенттің жауапкершілігі
      ctx.fillStyle = '#6b21a8';
      ctx.font = 'bold 19px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('4.2 Студенттің жауапкершілігі', 70, currentY + 15);

      const items4_2 = [
        'Ережелерді бірінші рет бұзу – жазбаша ескерту.',
        'Екінші рет бұзу – декан алдында түсіндірме жазу, ата-аналарға хабарлау.',
        'Үшінші рет немесе өрескел бұзу – тәртіптік комиссия, оқудан шығару мүмкіндігі.',
        'Мүлікті зақымдаған жағдайда – материалдық залалды өтеу міндеті.'
      ];

      currentY += 30;
      items4_2.forEach((text) => {
        ctx.fillStyle = '#6b21a8';
        ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
        ctx.fillText('■', 70, currentY + 18);
        currentY = wrapAndDrawText(text, 90, currentY + 18, canvasWidth - 160, 24, 17, false, darkGray) + 5;
      });

      // Signature Fields at the bottom
      currentY += 25;
      const signatureBoxes = [
        'Колледж директоры:',
        'Оқу ісі жөніндегі директор орынбасары:',
        'Қауіпсіздік жөніндегі маман:'
      ];

      signatureBoxes.forEach((title) => {
        ctx.fillStyle = darkNavy;
        ctx.font = 'bold 17px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(title, 70, currentY + 22);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'normal 17px monospace';
        ctx.fillText('_______________________  /  _________________________  /', 420, currentY + 22);
        
        currentY += 38;
      });

      drawFooter();
    }

    return canvas;
  };

  // Stagger render call to build each PDF page sequentially and stitch safely into jsPDF container
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const canvas = drawPage(pageNum);
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Append to document container
    if (pageNum > 1) {
      doc.addPage();
    }
    doc.addImage(imgData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm, undefined, 'FAST');
  }

  // Release and trigger automated download
  doc.save('Kainar_Teachers_Safety_Guidelines.pdf');
}
