    // SmartCity – Node.js (Pure JavaScript)
    // 6 ta pattern: Singleton + Facade + Abstract Factory + Builder + Proxy + Decorator

    console.clear();
    console.log("SmartCity Tizimi ishga tushdi!\n".repeat(2));

    const readline = require("readline");
    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });

    // 1. Singleton + 2. Facade
    class CityController {
    static instance = null;

    constructor() {
        if (CityController.instance) {
        return CityController.instance;
        }
        this.subsystems = new Map();
        CityController.instance = this;
    }

    static getInstance() {
        if (!CityController.instance) {
        CityController.instance = new CityController();
        }
        return CityController.instance;
    }

    register(name, subsystem) {
        this.subsystems.set(name, subsystem);
    }

    // Facade metodlari
    turnOnAllLights() {
        this.subsystems.get('lighting')?.turnOnAll();
    }

    emergencyStopTraffic() {
        this.subsystems.get('transport')?.emergencyStop();
    }

    getEnergyReport() {
        return this.subsystems.get('energy')?.getReport() || "Energiya tizimi ulanmagan";
    }

    setEnergyMode(mode) {
        this.subsystems.get('energy')?.setMode(mode);
    }
    }

    // 3. Abstract Factory
    class LightingFactory {
    createDevice() {
        return { name: "Smart Chiroq", status: () => "Yoqilgan – 90% yorug‘lik" };
    }
    }

    class TransportFactory {
    createDevice() {
        return { name: "Smart Svetofor", status: () => "YASHIL – harakat ruxsat" };
    }
    }

    const DeviceFactoryProvider = {
    getFactory(type) {
        if (type === 'lighting') return new LightingFactory();
        if (type === 'transport') return new TransportFactory();
        throw new Error("Noma'lum qurilma turi");
    }
    };

    // 4. Builder – Smart ko‘cha
    class SmartStreetBuilder {
    constructor() {
        this.lamps = 0;
        this.cameras = 0;
        this.solarPanels = 0;
    }

    addLamps(n) { this.lamps = Number(n) || 0; return this; }
    addCameras(n) { this.cameras = Number(n) || 0; return this; }
    addSolarPanels(n) { this.solarPanels = Number(n) || 0; return this; }

    build() {
        return {
        info: () => 
            `Chiroqlar: ${this.lamps} ta | Kameralar: ${this.cameras} ta | Quyosh panellari: ${this.solarPanels} ta`
        };
    }
    }

    // 5. Decorator – logging
    const withLogging = (fn, name = fn.name || 'funksiya') => {
    return function (...args) {
        console.log(`[LOG] ${name} ishga tushdi`);
        const result = fn.apply(this, args);
        console.log(`[LOG] ${name} tugadi`);
        return result;
    };
    };

    // 6. Proxy – ruxsat nazorati
    class RealEnergySystem {
    constructor() {
        this.mode = "normal";
    }

    getReport() {
        return `Energiya rejimi: ${this.mode} | Taxminiy sarf: ${this.mode === 'eco' ? 180 : this.mode === 'max' ? 450 : 312} kVt/soat`;
    }

    setMode(mode) {
        const validModes = ['eco', 'normal', 'max'];
        if (validModes.includes(mode.toLowerCase())) {
        this.mode = mode.toLowerCase();
        console.log(`→ Energiya rejimi "${this.mode}" ga o‘zgartirildi`);
        } else {
        console.log(`Xato: "${mode}" rejimi mavjud emas (eco / normal / max)`);
        }
    }
    }

    function createEnergyProxy(role = "guest") {
    const real = new RealEnergySystem();
    return new Proxy(real, {
        get(target, prop) {
        if (prop === "setMode" && role !== "admin") {
            return () => console.log("XATO: Faqat ADMIN energiya rejimini o‘zgartira oladi!");
        }
        return target[prop];
        }
    });
    }


    // Tizimni ishga tushirish
    const controller = CityController.getInstance();

    const lightingSystem = {
    turnOnAll: withLogging(() => {
        console.log("Barcha shahar chiroqlari YOQILDI! ✨");
    }, "turnOnAllLights")
    };

    const transportSystem = {
    emergencyStop: withLogging(() => {
        console.log("BARCHA TRANSPORT FAVQULODDA TO‘XTATILDI! ⚠️");
    }, "emergencyStop")
    };

    let currentEnergySystem = createEnergyProxy("guest");

    controller.register("lighting", lightingSystem);
    controller.register("transport", transportSystem);
    controller.register("energy", currentEnergySystem);

    const mainStreet = new SmartStreetBuilder()
    .addLamps(42)
    .addCameras(15)
    .addSolarPanels(28)
    .build();

    // ────────────── INTERAKTIV MENYU ───────────────────────

    function showMenu() {
    console.clear();
    console.log("\n" + "=".repeat(56));
    console.log("              SMART CITY BOSHQARUV PANELI");
    console.log("=".repeat(56));
    console.log("  1  →  Barcha chiroqlarni yoqish");
    console.log("  2  →  Favqulodda transportni to‘xtatish");
    console.log("  3  →  Energiya hisobotini ko‘rish");
    console.log("  4  →  Admin rejimga o‘tish");
    console.log("  5  →  Asosiy ko‘cha ma'lumotlari");
    console.log("  6  →  Energiya rejimini o‘zgartirish (eco / normal / max)");
    console.log("  0  →  Chiqish");
    console.log("-".repeat(56));

    rl.question("Tanlovingiz (0-6): ", handleChoice);
    }

    function handleChoice(input) {
    const choice = input.trim();

    switch (choice) {
        case "1":
        controller.turnOnAllLights();
        break;

        case "2":
        controller.emergencyStopTraffic();
        break;

        case "3":
        console.log("\n" + controller.getEnergyReport());
        break;

        case "4":
        currentEnergySystem = createEnergyProxy("admin");
        controller.register("energy", currentEnergySystem);
        console.log("\n→ ADMIN rejimi faollashtirildi! Endi 6-band orqali rejim o‘zgartirishingiz mumkin.");
        break;

        case "5":
        console.log("\nAsosiy ko‘cha holati:");
        console.log(mainStreet.info());
        break;

        case "6":
        rl.question("Yangi rejim (eco / normal / max): ", (modeInput) => {
            const mode = modeInput.trim().toLowerCase();
            controller.setEnergyMode(mode);
            setTimeout(showMenu, 2000);
        });
        return; // ichki savol tugaguncha kutamiz

        case "0":
        console.log("\nSmartCity tizimi o‘chirildi. Xayr, Shahzod! 👋");
        rl.close();
        return;

        default:
        console.log("\nNoto‘g‘ri tanlov. Iltimos 0-6 oralig‘idan tanlang.");
    }

    setTimeout(showMenu, 900);
    }

    // Dasturni boshlash
    console.log("\nIshlatilgan design patternlar:");
    console.log("  • Singleton     • Facade");
    console.log("  • Abstract Factory     • Builder");
    console.log("  • Decorator     • Proxy\n");

    console.log("Tizim tayyor! Menyuni ochish uchun istalgan tugmani bosing...\n");

    showMenu();