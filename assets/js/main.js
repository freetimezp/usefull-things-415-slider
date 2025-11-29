document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(Draggable);

    const body = document.body;
    const slides = document.querySelectorAll(".slide");
    const totalSlides = slides.length;

    let currentIndex = 0;
    let isAnimating = false;

    const Y_OFFSET = 25;
    const SCALE_STEP = 0.05;

    const timelineTicksContainer = document.querySelector(".timeline-ticks");
    const centerStatusBar = document.getElementById("center-project-status");
    const centerStatusCode = document.getElementById("center-status-code");

    function generateTicks() {
        timelineTicksContainer.innerHTML = "";

        slides.forEach((slide, i) => {
            const tick = document.createElement("div");

            tick.classList.add("tick");
            tick.setAttribute("data-index", (i + 1).toString().padStart(2, "0"));
            timelineTicksContainer.appendChild(tick);
        });
    }

    function getIndex(index) {
        return (index + totalSlides) % totalSlides;
    }

    function updateState(index) {
        const activeSlide = slides[index];
        const newBgColor = activeSlide.getAttribute("data-bg-color");
        const projectName = activeSlide.querySelector(".slide-title").textContent;
        const slideNumber = (index + 1).toString().padStart(2, "0");

        gsap.to(body, {
            backgroundColor: newBgColor,
            duration: 0.2,
            ease: "power1.inOut",
        });

        centerStatusBar.textContent = `${slideNumber} - ${totalSlides} ${projectName}`;
        centerStatusCode.textContent = `[${slideNumber === "01" ? "00" : "50"}]`;

        const ticks = document.querySelectorAll(".tick");
        ticks.forEach((tick, i) => {
            tick.classList.remove("active");

            if (i === index) {
                tick.classList.add("active");
            }
        });

        slides.forEach((slide) => slide.classList.remove("slide-active"));
        activeSlide.classList.add("slide-active");
    }

    function setInitialStacking() {
        generateTicks();

        slides.forEach((slide, i) => {
            const depth = totalSlides - i;
            const offsetY = i * Y_OFFSET;
            const scale = 1 - i * SCALE_STEP;

            gsap.set(slide, {
                zIndex: depth,
                y: -offsetY,
                scale: scale,
                opacity: i === 0 ? "auto" : "none",
            });
        });

        updateState(currentIndex);
    }

    function gotoSlide(newIndex, direction) {
        const normalizedNewIndex = getIndex(newIndex);
        if (isAnimating || normalizedNewIndex == currentIndex) return;

        isAnimating = true;
        currentIndex = normalizedNewIndex;

        const tl = gsap.timeline({
            defaults: { duration: 0.8, ease: "power2.inOut" },
            onComplete: () => {
                isAnimating = false;
            },
        });

        updateState(currentIndex);

        slides.forEach((slide, i) => {
            const indexFromCurrent = getIndex(i - currentIndex);

            const depth = totalSlides - Math.abs(indexFromCurrent);
            const absIndex = Math.abs(indexFromCurrent);
            const offsetY = absIndex * Y_OFFSET;
            const scale = 1 - absIndex * SCALE_STEP;

            tl.to(
                slide,
                {
                    zIndex: depth,
                    y: indexFromCurrent < 0 ? offsetY : -offsetY,
                    scale: scale,
                    opacity: absIndex === 0 ? 1 : 0.8 - absIndex * 0.1,
                    pointerEvents: absIndex === 0 ? "auto" : "none",
                },
                0
            );
        });

        const activeSlide = slides[currentIndex];

        tl.fromTo(
            activeSlide.querySelector("img"),
            {
                y: direction === "next" ? 50 : -50,
            },
            {
                y: 0,
                duration: 1.2,
                ease: "power2.out",
            },
            0
        );
    }

    function showNext() {
        gotoSlide(currentIndex + 1, "next");
    }
    function showPrev() {
        gotoSlide(currentIndex - 1, "prev");
    }

    Draggable.create("#swipe-area-overlay", {
        type: "y",
        edgeResistance: 0.8,
        liveDrag: true,
        inertia: true,
        preventDefault: true,
        onDrag: function () {
            gsap.set(this.target, { y: 0 });
        },
        onDragEnd: function () {
            const threshold = 30;

            if (this.y - this.startY > threshold) {
                showPrev();
            } else if (this.startY - this.y > threshold) {
                showNext();
            }

            gsap.to(this.target, {
                y: 0,
                duration: 0.1,
            });
        },
    });

    setInitialStacking();

    const cursor = document.getElementById("custom-cursor");

    document.addEventListener("mousemove", (e) => {
        gsap.to(cursor, {
            duration: 0.15,
            ease: "power2.out",
            transform: `translate(${e.clientX - cursor.offsetWidth / 2}px, ${e.clientY - cursor.offsetHeight / 2}px)`,
        });
    });

    const sliderContainer = document.querySelector(".slider-container");

    if (sliderContainer) {
        sliderContainer.addEventListener("mouseenter", () => {
            gsap.to(cursor, {
                scale: 1.5,
                duration: 0.3,
            });
        });

        sliderContainer.addEventListener("mouseleave", () => {
            gsap.to(cursor, {
                scale: 1,
                duration: 0.3,
            });
        });
    }
});
