import { useEffect, useRef, useState } from "react";

import portfolio from "./content/portfolio.json";
import { resolveMedia } from "./media";
import type { Project } from "./media";

const published = portfolio.projects.filter((project) => project.published);
const projects: Project[] = published.some((project) => !project.sample)
  ? published.filter((project) => !project.sample)
  : published;
const reelProjects = projects.filter((project) => project.category === "social");
const eventProjects = projects.filter((project) => project.category === "events");
const portraitUrl = portfolio.profile.portraitUrl;
const assetUrl = (url: string) => url.startsWith("/media/") ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url;

const editingTools = [
  { name: "Adobe Premiere Pro", mark: "Pr" },
  { name: "Adobe After Effects", mark: "Ae" },
];

const contacts = [
  { label: "Email", text: portfolio.profile.email, href: `mailto:${portfolio.profile.email}` },
  { label: "Instagram", text: portfolio.profile.instagramHandle, href: portfolio.profile.instagramUrl },
];

function OpenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m9 7 8 5-8 5V7Z" />
    </svg>
  );
}

function ContactIcon({ label }: { label: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {label === "Email" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        </>
      ) : (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (project: Project) => void;
}) {
  return (
    <button
      className={`project-card project-card--${project.format}`}
      type="button"
      onClick={() => onOpen(project)}
      aria-label={`Open ${project.title}${project.sample ? " sample" : ""}`}
      aria-haspopup="dialog"
    >
      <span className="project-visual">
        {project.coverUrl ? (
          <img className="project-cover" src={assetUrl(project.coverUrl)} alt="" loading="lazy" />
        ) : (
          <span className="project-grid" aria-hidden="true" />
        )}
        {project.sample && <span className="sample-label">Sample project</span>}
        {!project.coverUrl && !project.sample && <span className="cover-title" aria-hidden="true">{project.title}</span>}
        {!project.sample && resolveMedia(project).kind === "instagram" && (
          <span className="sample-label">Instagram</span>
        )}
        <span className="play-button">
          <PlayIcon />
        </span>
      </span>
      <span className="project-meta">
        <span>
          <strong>{project.title}</strong>
          <small>{project.type}</small>
        </span>
        <span className="card-arrow">
          <OpenIcon />
        </span>
      </span>
    </button>
  );
}

function VideoDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const media = project ? resolveMedia(project) : null;
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!project || !dialog) return;

    const trigger = document.activeElement as HTMLElement | null;
    setVideoFailed(false);
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("dialog-open");
    closeButtonRef.current?.focus();

    return () => {
      document.body.classList.remove("dialog-open");
      trigger?.focus();
    };
  }, [project]);

  const closeDialog = () => {
    dialogRef.current?.querySelector("video")?.pause();
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`video-dialog${project?.format === "vertical" ? " video-dialog--vertical" : ""}`}
      aria-labelledby="dialog-title"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      {project && (
        <div className="dialog-panel">
          <div className="dialog-header">
            <div>
              <span className="eyebrow">Video preview</span>
              <h3 id="dialog-title">{project.title}</h3>
            </div>
            <button
              ref={closeButtonRef}
              className="close-button"
              type="button"
              onClick={closeDialog}
              aria-label="Close video preview"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className={`dialog-media dialog-media--${project.format}${media?.kind === "instagram" ? " dialog-media--instagram" : ""}`}>
            {media?.kind === "instagram" ? (
              <iframe
                key={media.embedUrl}
                src={media.embedUrl}
                title={`${project.title} on Instagram`}
                allow="fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : media?.kind === "video" && !videoFailed ? (
              <video key={media.url} src={assetUrl(media.url)} poster={project.coverUrl ? assetUrl(project.coverUrl) : undefined} controls playsInline preload="none" onError={() => setVideoFailed(true)}>
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="dialog-placeholder">
                <span className="dialog-play"><PlayIcon /></span>
                <strong>{project.sample ? "Sample project" : "Preview unavailable"}</strong>
                <span>{project.sample ? "This is a layout sample, not a completed project." : "The video could not be loaded. Please try again later."}</span>
              </div>
            )}
          </div>
          {project.description && <p className="project-description">{project.description}</p>}
          {media?.kind === "instagram" && (
            <div className="instagram-fallback">
              <p>If the preview does not load, open the original post.</p>
              <a className="text-link" href={media.url} target="_blank" rel="noopener noreferrer">Watch on Instagram</a>
            </div>
          )}

          <div className="dialog-footer">
            <span>{project.type}</span>
            <span>{project.format === "vertical" ? "9:16 vertical" : "16:9 horizontal"}</span>
          </div>
        </div>
      )}
    </dialog>
  );
}

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("has-entered");
        observer.unobserve(entry.target);
      }
    });

    mainRef.current
      ?.querySelectorAll("[data-entrance]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Omar Almalla, home">
          <span>OA</span>
          {portfolio.profile.name}
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top" ref={mainRef}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-intro" data-entrance>
            <div className="portrait">
              {portraitUrl ? (
                <img src={assetUrl(portraitUrl)} alt={portfolio.profile.name} width={160} height={160} />
              ) : (
                <span className="portrait-placeholder" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="11.5" r="4.5" />
                    <path d="M7 26v-1.5a9 7 0 0 1 18 0V26" />
                  </svg>
                  <span>Photo placeholder</span>
                </span>
              )}
            </div>
            <div className="hero-copy">
              <span className="eyebrow">Video editor</span>
              <h1 id="hero-title">{portfolio.profile.name}</h1>
              <p>{portfolio.profile.tagline}</p>
              <a className="text-link" href="#work">
                View selected work <OpenIcon />
              </a>
            </div>
          </div>
        </section>

        <section className="work-section" id="work" aria-labelledby="work-title">
          <div className="section-heading" data-entrance>
            <div>
              <span className="eyebrow">Portfolio</span>
              <h2 id="work-title">Selected work</h2>
            </div>
            <p>{projects.every((project) => project.sample)
              ? "A preview of the portfolio layout. Real projects will appear here soon."
              : "Social stories and event highlights. Select a project to watch."}</p>
          </div>

          <div className="work-group" data-entrance>
            <div className="group-heading">
              <h3>Reels &amp; social</h3>
              <span>Short-form edits</span>
            </div>
            <div className="reels-grid">
              {reelProjects.length === 0 && <p className="empty-work">Reels will appear here soon.</p>}
              {reelProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} />
              ))}
            </div>
          </div>

          <div className="work-group" data-entrance>
            <div className="group-heading">
              <h3>Event coverage</h3>
              <span>Highlights &amp; moments</span>
            </div>
            <div className="events-grid">
              {eventProjects.length === 0 && <p className="empty-work">Event projects will appear here soon.</p>}
              {eventProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} />
              ))}
            </div>
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title" data-entrance>
          <div>
            <span className="eyebrow">About</span>
            <h2 id="about-title">Focused edits, shaped around the story.</h2>
          </div>
          <div className="about-copy">
            <p>
              {portfolio.profile.about}
            </p>
            <div className="tools">
              <h3 className="eyebrow">Editing tools</h3>
              <ul>
                {editingTools.map(({ name, mark }) => (
                  <li key={mark}>
                    <span className="adobe-icon" aria-hidden="true">
                      {mark}
                    </span>
                    <strong>{name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          className="contact-section"
          id="contact"
          aria-labelledby="contact-title"
          data-entrance
        >
          <div>
            <span className="eyebrow">Contact</span>
            <h2 id="contact-title">Have a project in mind?</h2>
            <p>Let’s talk about the footage, format, and story.</p>
          </div>
          <div className="contact-links">
            {contacts.map(({ label, text, href }) => (
              <a className="contact-link" href={href} key={label} target={label === "Instagram" ? "_blank" : undefined} rel={label === "Instagram" ? "noopener noreferrer" : undefined}>
                <span className="contact-icon">
                  <ContactIcon label={label} />
                </span>
                <span className="contact-detail">
                  <span>{label}</span>
                  <strong>{text}</strong>
                </span>
                <span className="contact-arrow">
                  <OpenIcon />
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <a className="wordmark" href="#top">
          <span>OA</span>
          {portfolio.profile.name}
        </a>
        <p>Video editing · Social reels · Events</p>
        <a href="#top">Back to top</a>
      </footer>

      <VideoDialog project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}
