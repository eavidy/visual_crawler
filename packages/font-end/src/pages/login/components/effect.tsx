import React, { useEffect, useRef } from "react";

const color = "154,209,249";
class Particle {
    private directionX: number;
    private directionY: number;
    constructor(private ctx: CanvasRenderingContext2D, public x: number, public y: number) {
        // x，y轴的移动速度  -0.5 -- 0.5
        this.directionX = Math.random() - 0.5;
        this.directionY = Math.random() - 0.5;
    }

    // 更新点的坐标
    update() {
        this.x += this.directionX;
        this.y += this.directionY;
    }

    // 绘制粒子
    draw() {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

class Canvas {
    private particlesArray: Particle[] = [];
    private ctx: CanvasRenderingContext2D;
    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d")!;
        this.resize();
    }
    resize = () => {
        const canvas = this.canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.count = Math.round(((canvas.width / 80) * canvas.height) / 80);
    };
    count!: number; // 定义页面内粒子的数量
    // 创建粒子
    createParticle() {
        // 生成一个点的随机坐标
        var x = Math.random() * innerWidth;
        var y = Math.random() * innerHeight;

        this.particlesArray.push(new Particle(this.ctx, x, y));
    }
    // 处理粒子
    // 先更新坐标，再绘制出来
    handleParticle() {
        const particlesArray = this.particlesArray;
        const canvas = this.canvas;
        const ctx = this.ctx;

        let nextArray: Particle[] = [];
        for (var i = 0; i < particlesArray.length; i++) {
            var particle = particlesArray[i];
            particle.update();
            particle.draw();
            // 超出范围就将这个粒子删除
            if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
                // particlesArray.splice(i, 1);
            } else nextArray.push(particle);

            // 绘制两个点之间的连线
            for (var j = i + 1; j < particlesArray.length; j++) {
                let dx = particlesArray[j].x - particlesArray[i].x;
                let dy = particlesArray[j].y - particlesArray[i].y;
                let dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${color}, ` + (1 - dist / 100);
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.closePath();
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        this.particlesArray = nextArray;
    }
    render() {
        if (this.intId) return;
        window.addEventListener("resize", this.resize);
        this.intId = setInterval(this.update, 1000 / 60);
    }
    stopRender() {
        clearInterval(this.intId);
        window.removeEventListener("resize", this.resize);
        this.intId = undefined;
    }
    private intId?: number;
    private update = () => {
        const ctx = this.ctx;
        const canvas = this.canvas;
        // 首先清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 如果粒子数量小于规定数量，就生成新的粒子
        if (this.particlesArray.length < this.count) {
            this.createParticle();
        }

        // 处理粒子
        this.handleParticle();
    };
}
export function Effect(props: { style?: React.CSSProperties }) {
    const ref = useRef<HTMLCanvasElement>(null);

    // 设置div背景的宽高
    useEffect(() => {
        const canvas = ref.current!;

        let vd = new Canvas(canvas);
        vd.render();

        return () => {
            vd.stopRender();
        };
    }, []);

    // 设置定时器
    return <canvas id="canvas" ref={ref} style={{ width: "100%", height: "100%", ...props.style }} />;
}
